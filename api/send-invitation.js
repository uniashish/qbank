import { createInvitationEmailTemplate } from "../src/server/email/invitationEmailTemplate.js";
import {
  buildInvitationUrl,
  getInvitationEmailFrom,
  getResendClient,
} from "../src/server/email/resendClient.js";
import {
  getInvitationEmailErrorMessage,
  getInvitationEmailErrorStatus,
  InvitationEmailError,
  validateInvitationEmailPermission,
  validateInvitationEmailRequest,
  validateInvitationForEmail,
} from "../src/server/email/invitationEmailValidation.js";
import { getFirebaseAdminServices } from "../src/server/firebase/admin.js";

const COLLECTIONS = {
  INVITATIONS: "invitations",
  SCHOOLS: "schools",
  USERS: "users",
};

function sendJson(res, statusCode, payload) {
  return res.status(statusCode).json(payload);
}

function getBearerToken(req) {
  const authorizationHeader = req.headers.authorization ?? "";
  const [scheme, token] = authorizationHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw new InvitationEmailError(401, "Authentication is required.");
  }

  return token;
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

function getDocumentData(snapshot) {
  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

async function getInvitationContext({ db, invitationId, schoolId, uid }) {
  const userRef = db.collection(COLLECTIONS.USERS).doc(uid);
  const invitationRef = db.collection(COLLECTIONS.INVITATIONS).doc(invitationId);
  const schoolRef = db.collection(COLLECTIONS.SCHOOLS).doc(schoolId);

  const [userSnapshot, invitationSnapshot, schoolSnapshot] = await Promise.all([
    userRef.get(),
    invitationRef.get(),
    schoolRef.get(),
  ]);

  return {
    callerProfile: getDocumentData(userSnapshot),
    invitation: getDocumentData(invitationSnapshot),
    school: getDocumentData(schoolSnapshot),
  };
}

function isInvalidAuthTokenError(error) {
  return (
    typeof error?.code === "string" &&
    error.code.startsWith("auth/") &&
    error.code !== "auth/internal-error"
  );
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST");
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, {
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
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

    const requestPayload = validateInvitationEmailRequest(body);
    const token = getBearerToken(req);
    const { auth, db } = getFirebaseAdminServices();
    const decodedToken = await auth.verifyIdToken(token);
    const { callerProfile, invitation, school } = await getInvitationContext({
      db,
      invitationId: requestPayload.invitationId,
      schoolId: requestPayload.schoolId,
      uid: decodedToken.uid,
    });
    const validatedInvitation = validateInvitationForEmail({
      invitation,
      invitationId: requestPayload.invitationId,
      school,
      schoolId: requestPayload.schoolId,
    });

    validateInvitationEmailPermission({
      callerProfile,
      invitation: validatedInvitation,
    });

    const invitationUrl = buildInvitationUrl(validatedInvitation.token);
    const emailTemplate = createInvitationEmailTemplate({
      invitation: validatedInvitation,
      invitationUrl,
      school,
    });
    const response = await getResendClient().emails.send({
      from: getInvitationEmailFrom(),
      to: [validatedInvitation.email],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (response?.error) {
      console.error("[send-invitation] Resend rejected invitation email.", {
        invitationId: requestPayload.invitationId,
        schoolId: requestPayload.schoolId,
        message: response.error.message,
        name: response.error.name,
      });
      throw new InvitationEmailError(502, "Invitation email could not be sent.");
    }

    return sendJson(res, 200, {
      success: true,
      messageId: response?.data?.id ?? response?.id ?? "",
    });
  } catch (error) {
    if (isInvalidAuthTokenError(error)) {
      return sendJson(res, 401, {
        success: false,
        error: "Authentication is required.",
      });
    }

    const statusCode = getInvitationEmailErrorStatus(error);

    if (statusCode >= 500) {
      console.error("[send-invitation] Failed to send invitation email.", {
        message: error?.message,
        name: error?.name,
      });
    }

    return sendJson(res, statusCode, {
      success: false,
      error: getInvitationEmailErrorMessage(error),
    });
  }
}
