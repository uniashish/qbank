import crypto from "node:crypto";

import { buildGoogleDocsExportModel } from "../src/features/question-paper/export/google-docs/buildGoogleDocsExportModel.js";
import { createGoogleDocUrl } from "../src/features/question-paper/export/google-docs/googleDocsExportUtils.js";
import { getFirebaseAdminServices } from "../src/server/firebase/admin.js";

const COLLECTIONS = {
  QUESTION_PAPERS: "questionPapers",
  SCHOOLS: "schools",
  USERS: "users",
};
const GOOGLE_DOCS_EXPORT_MESSAGE_TYPE = "qbank-google-docs-export";
const GOOGLE_DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const GOOGLE_DOC_MIME_TYPE = "application/vnd.google-apps.document";
const HTML_MIME_TYPE = "text/html; charset=UTF-8";
const MAX_STATE_AGE_MS = 15 * 60 * 1000;

class GoogleDocsExportError extends Error {
  constructor(statusCode, message, docs = []) {
    super(message);
    this.name = "GoogleDocsExportError";
    this.statusCode = statusCode;
    this.docs = docs;
  }
}

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

async function readJsonBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return req.body.length > 0 ? JSON.parse(req.body.toString("utf8")) : {};
  }

  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    return req.body ? JSON.parse(req.body) : {};
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization ?? "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new GoogleDocsExportError(401, "Authentication is required.");
  }

  return token;
}

function getRequestOrigin(req) {
  const headerOrigin = req.headers.origin;

  if (headerOrigin) {
    return headerOrigin;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const protocol = req.headers["x-forwarded-proto"] || "https";

  if (!host) {
    throw new GoogleDocsExportError(
      500,
      "Google Docs export origin could not be resolved.",
    );
  }

  return `${protocol}://${host}`;
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new GoogleDocsExportError(
      500,
      "Google Docs export is not configured.",
    );
  }

  return value;
}

function getGoogleOAuthConfig(req) {
  const origin = getRequestOrigin(req);
  const redirectUri =
    process.env.GOOGLE_OAUTH_REDIRECT_URI?.trim() ||
    `${origin}/api/export-question-paper-google-doc?oauthCallback=1`;

  return {
    clientId: getRequiredEnv("GOOGLE_OAUTH_CLIENT_ID"),
    clientSecret: getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
    redirectUri,
    stateSecret:
      process.env.GOOGLE_OAUTH_STATE_SECRET?.trim() ||
      getRequiredEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
  };
}

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");
}

function base64UrlDecode(value) {
  const normalizedValue = value.replaceAll("-", "+").replaceAll("_", "/");
  const paddedValue = normalizedValue.padEnd(
    normalizedValue.length + ((4 - (normalizedValue.length % 4)) % 4),
    "=",
  );

  return Buffer.from(paddedValue, "base64").toString("utf8");
}

function signStatePayload(payload, stateSecret) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", stateSecret)
    .update(encodedPayload)
    .digest("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/u, "");

  return `${encodedPayload}.${signature}`;
}

function verifyState(state, stateSecret) {
  const [encodedPayload, signature] = String(state ?? "").split(".");

  if (!encodedPayload || !signature) {
    throw new GoogleDocsExportError(400, "Google authorization state is invalid.");
  }

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const expectedState = signStatePayload(payload, stateSecret);
  const expectedSignature = expectedState.split(".")[1];

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    )
  ) {
    throw new GoogleDocsExportError(400, "Google authorization state is invalid.");
  }

  if (!payload.iat || Date.now() - payload.iat > MAX_STATE_AGE_MS) {
    throw new GoogleDocsExportError(400, "Google authorization has expired.");
  }

  return payload;
}

function getQueryValue(query, name) {
  const value = query?.[name];

  return Array.isArray(value) ? value[0] : value;
}

function getDocumentData(snapshot) {
  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function loadAuthorizedPaper({ db, paperId, uid }) {
  if (!paperId || typeof paperId !== "string") {
    throw new GoogleDocsExportError(400, "Choose a question paper to export.");
  }

  const userSnapshot = await db.collection(COLLECTIONS.USERS).doc(uid).get();
  const userProfile = getDocumentData(userSnapshot);

  if (
    !userProfile ||
    userProfile.role !== "teacher" ||
    userProfile.status !== "active" ||
    !userProfile.schoolId
  ) {
    throw new GoogleDocsExportError(
      403,
      "Only active teachers can export question papers.",
    );
  }

  const paperSnapshot = await db
    .collection(COLLECTIONS.SCHOOLS)
    .doc(userProfile.schoolId)
    .collection(COLLECTIONS.QUESTION_PAPERS)
    .doc(paperId)
    .get();
  const paper = getDocumentData(paperSnapshot);

  if (
    !paper ||
    paper.status !== "final" ||
    paper.createdBy?.uid !== uid
  ) {
    throw new GoogleDocsExportError(
      403,
      "Only your finalized question papers can be exported.",
    );
  }

  return paper;
}

function buildAuthorizationUrl({ answerKeyOptions, paperId, req, uid }) {
  const config = getGoogleOAuthConfig(req);
  const state = signStatePayload(
    {
      answerKeyOptions,
      iat: Date.now(),
      origin: getRequestOrigin(req),
      paperId,
      uid,
    },
    config.stateSecret,
  );
  const authorizationUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  authorizationUrl.searchParams.set("access_type", "online");
  authorizationUrl.searchParams.set("client_id", config.clientId);
  authorizationUrl.searchParams.set("include_granted_scopes", "true");
  authorizationUrl.searchParams.set("prompt", "consent");
  authorizationUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", GOOGLE_DRIVE_FILE_SCOPE);
  authorizationUrl.searchParams.set("state", state);

  return authorizationUrl.toString();
}

async function exchangeAuthorizationCode({ code, req }) {
  const config = getGoogleOAuthConfig(req);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.redirectUri,
    }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new GoogleDocsExportError(
      401,
      "Google Docs permission could not be completed.",
    );
  }

  const payload = await response.json();

  if (!payload.access_token) {
    throw new GoogleDocsExportError(
      401,
      "Google Docs permission did not return an access token.",
    );
  }

  return payload.access_token;
}

function createMultipartUploadBody({ html, title }) {
  const boundary = `qbank-google-doc-${crypto.randomUUID()}`;
  const metadata = {
    mimeType: GOOGLE_DOC_MIME_TYPE,
    name: title,
  };
  const chunks = [
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from("Content-Type: application/json; charset=UTF-8\r\n\r\n"),
    Buffer.from(JSON.stringify(metadata)),
    Buffer.from(`\r\n--${boundary}\r\n`),
    Buffer.from(`Content-Type: ${HTML_MIME_TYPE}\r\n\r\n`),
    Buffer.from(html, "utf8"),
    Buffer.from(`\r\n--${boundary}--\r\n`),
  ];

  return {
    body: Buffer.concat(chunks),
    contentType: `multipart/related; boundary=${boundary}`,
  };
}

async function uploadGoogleDoc({ accessToken, documentPayload }) {
  const { body, contentType } = createMultipartUploadBody(documentPayload);
  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": contentType,
      },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new GoogleDocsExportError(
      502,
      "Google Docs document could not be created.",
    );
  }

  const payload = await response.json();

  return {
    id: payload.id,
    title: payload.name || documentPayload.title,
    url: payload.webViewLink || createGoogleDocUrl(payload.id),
  };
}

async function createGoogleDocs({ accessToken, answerKeyOptions, paper }) {
  const exportModel = buildGoogleDocsExportModel({
    answerKeyOptions,
    paper,
  });
  const docs = [];

  for (const documentPayload of exportModel.documents) {
    try {
      const doc = await uploadGoogleDoc({
        accessToken,
        documentPayload,
      });

      docs.push(doc);
    } catch (error) {
      if (docs.length > 0) {
        throw new GoogleDocsExportError(
          error.statusCode || 502,
          "Some Google Docs were created, but the export did not fully complete.",
          docs,
        );
      }

      throw error;
    }
  }

  return docs;
}

function serializeForScript(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function renderCallbackHtml({ docs = [], error = "", origin, success }) {
  const message = {
    docs,
    error,
    success,
    type: GOOGLE_DOCS_EXPORT_MESSAGE_TYPE,
  };
  const linksHtml = docs
    .map(
      (doc) =>
        `<li><a href="${doc.url}" rel="noreferrer" target="_blank">${doc.title}</a></li>`,
    )
    .join("");

  return [
    "<!doctype html>",
    "<html>",
    "<head><meta charset=\"utf-8\"><title>Google Docs Export</title></head>",
    "<body>",
    success
      ? "<p>Question Paper created successfully. You can close this window.</p>"
      : `<p>${error || "Google Docs export failed."}</p>`,
    docs.length ? `<ul>${linksHtml}</ul>` : "",
    "<script>",
    `const message = ${serializeForScript(message)};`,
    `const targetOrigin = ${serializeForScript(origin)};`,
    "if (window.opener) { window.opener.postMessage(message, targetOrigin); window.close(); }",
    "</script>",
    "</body>",
    "</html>",
  ].join("");
}

function sendCallbackHtml(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.end(renderCallbackHtml(payload));
}

function isInvalidAuthTokenError(error) {
  return (
    typeof error?.code === "string" &&
    error.code.startsWith("auth/") &&
    error.code !== "auth/internal-error"
  );
}

async function handlePrepareRequest(req, res) {
  let body;

  try {
    body = await readJsonBody(req);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return sendJson(res, 400, {
        success: false,
        error: "Request body must be valid JSON.",
      });
    }

    throw error;
  }

  const token = getBearerToken(req);
  const { auth, db } = getFirebaseAdminServices();
  const decodedToken = await auth.verifyIdToken(token);

  await loadAuthorizedPaper({
    db,
    paperId: body.paperId,
    uid: decodedToken.uid,
  });

  return sendJson(res, 200, {
    authorizationUrl: buildAuthorizationUrl({
      answerKeyOptions: body.answerKeyOptions,
      paperId: body.paperId,
      req,
      uid: decodedToken.uid,
    }),
    success: true,
  });
}

async function handleOAuthCallback(req, res) {
  const query = req.query ?? {};
  const config = getGoogleOAuthConfig(req);
  let origin = getRequestOrigin(req);

  try {
    if (getQueryValue(query, "error")) {
      throw new GoogleDocsExportError(
        401,
        "Google Docs permission was not granted.",
      );
    }

    const statePayload = verifyState(getQueryValue(query, "state"), config.stateSecret);
    origin = statePayload.origin || origin;

    const code = getQueryValue(query, "code");

    if (!code) {
      throw new GoogleDocsExportError(
        400,
        "Google authorization code is missing.",
      );
    }

    const accessToken = await exchangeAuthorizationCode({
      code,
      req,
    });
    const { db } = getFirebaseAdminServices();
    const paper = await loadAuthorizedPaper({
      db,
      paperId: statePayload.paperId,
      uid: statePayload.uid,
    });
    const docs = await createGoogleDocs({
      accessToken,
      answerKeyOptions: statePayload.answerKeyOptions,
      paper,
    });

    return sendCallbackHtml(res, 200, {
      docs,
      origin,
      success: true,
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      console.error("[google-docs-export] Export failed.", {
        message: error?.message,
        name: error?.name,
      });
    }

    return sendCallbackHtml(res, statusCode, {
      docs: error.docs ?? [],
      error: error.message || "Google Docs export failed.",
      origin,
      success: false,
    });
  }
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST");
    return res.status(204).end();
  }

  if (req.method === "GET" && req.query?.oauthCallback) {
    return handleOAuthCallback(req, res);
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return sendJson(res, 405, {
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    return await handlePrepareRequest(req, res);
  } catch (error) {
    if (isInvalidAuthTokenError(error)) {
      return sendJson(res, 401, {
        success: false,
        error: "Authentication is required.",
      });
    }

    const statusCode = error.statusCode || 500;

    if (statusCode >= 500) {
      console.error("[google-docs-export] Export preparation failed.", {
        message: error?.message,
        name: error?.name,
      });
    }

    return sendJson(res, statusCode, {
      success: false,
      error: error.message || "Google Docs export could not be started.",
    });
  }
}
