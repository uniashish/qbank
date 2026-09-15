import {
  getIdToken,
  reload,
  sendEmailVerification,
} from "firebase/auth";

import { auth } from "./firebase";

export const EMAIL_VERIFICATION_ERROR_CODES = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  MISSING_AUTH_USER: "MISSING_AUTH_USER",
};

function createEmailVerificationError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function getUserDiagnostics(user) {
  return {
    email: user?.email ?? null,
    emailVerified: Boolean(user?.emailVerified),
    uid: user?.uid ?? null,
  };
}

function getActionCodeSettings() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return {
    handleCodeInApp: false,
    url: `${window.location.origin}${window.location.pathname}`,
  };
}

function logAuthDiagnostic(action, user, error) {
  const details = {
    ...getUserDiagnostics(user),
    code: error?.code,
    message: error?.message,
  };

  if (error) {
    console.error(`[Email verification] ${action} failed.`, details, error);
    return;
  }

  console.info(`[Email verification] ${action}.`, details);
}

export async function sendVerificationEmail(user = auth.currentUser) {
  if (!user) {
    throw createEmailVerificationError(
      EMAIL_VERIFICATION_ERROR_CODES.MISSING_AUTH_USER,
      "Sign in before requesting a verification email.",
    );
  }

  try {
    logAuthDiagnostic("sendEmailVerification start", user);
    await sendEmailVerification(user, getActionCodeSettings());
    logAuthDiagnostic("sendEmailVerification success", user);
  } catch (error) {
    logAuthDiagnostic("sendEmailVerification", user, error);
    throw error;
  }
}

export async function reloadCurrentUser() {
  const user = auth.currentUser;

  if (!user) {
    throw createEmailVerificationError(
      EMAIL_VERIFICATION_ERROR_CODES.MISSING_AUTH_USER,
      "Sign in before checking email verification.",
    );
  }

  try {
    logAuthDiagnostic("reload(user) start", user);
    await reload(user);
    logAuthDiagnostic("reload(user) success", user);
  } catch (error) {
    logAuthDiagnostic("reload(user)", user, error);
    throw error;
  }

  try {
    logAuthDiagnostic("getIdToken(true) start", user);
    await getIdToken(user, true);
    logAuthDiagnostic("getIdToken(true) success", user);
  } catch (error) {
    logAuthDiagnostic("getIdToken(true)", user, error);
    throw error;
  }

  return user;
}

export async function requireVerifiedCurrentUser() {
  const user = await reloadCurrentUser();

  if (!user.emailVerified) {
    throw createEmailVerificationError(
      EMAIL_VERIFICATION_ERROR_CODES.EMAIL_NOT_VERIFIED,
      "Verify your email address before accepting this invitation.",
    );
  }

  return user;
}
