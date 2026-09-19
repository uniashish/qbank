import { getFirebaseAdminServices } from "../src/server/firebase/admin.js";

const COLLECTIONS = {
  SCHOOLS: "schools",
};

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

function getSchoolResult(snapshot) {
  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data();

  return {
    allowJoinRequests: data.allowJoinRequests !== false,
    id: doc.id,
    name: data.name,
    status: data.status,
  };
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

    if (typeof body.schoolName !== "string" || !body.schoolName.trim()) {
      return sendJson(res, 400, {
        success: false,
        error: "Enter the exact school name.",
      });
    }

    const { db } = getFirebaseAdminServices();
    const schoolsSnapshot = await db
      .collection(COLLECTIONS.SCHOOLS)
      .where("name", "==", body.schoolName)
      .limit(1)
      .get();

    return sendJson(res, 200, {
      success: true,
      school: getSchoolResult(schoolsSnapshot),
    });
  } catch (error) {
    console.error("[find-school] Failed to find school by exact name.", {
      message: error?.message,
      name: error?.name,
    });

    return sendJson(res, 500, {
      success: false,
      error: "School lookup failed. Try again in a moment.",
    });
  }
}
