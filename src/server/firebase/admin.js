import {
  applicationDefault,
  cert,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function normalizePrivateKey(privateKey) {
  return privateKey?.replace(/\\n/g, "\n");
}

function getTrimmedEnv(name) {
  return process.env[name]?.trim() ?? "";
}

function getServiceAccountFromJson() {
  const serviceAccountJson = getTrimmedEnv("FIREBASE_SERVICE_ACCOUNT_JSON");

  if (!serviceAccountJson) {
    return null;
  }

  return JSON.parse(serviceAccountJson);
}

function getServiceAccountFromParts() {
  const projectId = getTrimmedEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getTrimmedEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return {
    projectId,
    clientEmail,
    privateKey,
  };
}

function getFirebaseAdminOptions() {
  const serviceAccount =
    getServiceAccountFromJson() ?? getServiceAccountFromParts();

  if (serviceAccount) {
    return {
      credential: cert(serviceAccount),
      projectId: serviceAccount.projectId,
    };
  }

  if (
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT
  ) {
    return {
      credential: applicationDefault(),
      projectId:
        getTrimmedEnv("FIREBASE_PROJECT_ID") ||
        getTrimmedEnv("GOOGLE_CLOUD_PROJECT") ||
        getTrimmedEnv("GCLOUD_PROJECT"),
    };
  }

  throw new Error("Firebase Admin credentials are not configured.");
}

export function getFirebaseAdminApp() {
  const existingApp = getApps()[0];

  if (existingApp) {
    return existingApp;
  }

  return initializeApp(getFirebaseAdminOptions());
}

export function getFirebaseAdminServices() {
  const app = getFirebaseAdminApp();

  return {
    auth: getAuth(app),
    db: getFirestore(app),
  };
}
