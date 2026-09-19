import { getIdToken } from "firebase/auth";
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";

import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import { INVITATION_STATUSES } from "../constants/invitationStatus.js";
import { USER_ROLES } from "../constants/roles.js";
import { db } from "./firebase";
import { isInvitationExpired } from "./invitationService.js";

const COLLECTIONS = {
  INVITATIONS: "invitations",
  SCHOOLS: "schools",
  USERS: "users",
};
const REDACTED_INVITATION_PATH = `${COLLECTIONS.INVITATIONS}/<redacted>`;

const SCHOOL_ADMIN_REDEMPTION_RULE_EXPECTATIONS = [
  "users/{uid} create -> isValidSchoolAdminProfileCreate(userId)",
  "schools/{schoolId} update -> isValidSchoolPrimaryAdminRedemption(schoolId)",
  "invitations/{invitationId} update -> isValidInvitationRedemption(invitationId)",
];

const INVITATION_ROLES = new Set([USER_ROLES.SCHOOL_ADMIN]);

export const INVITATION_REDEMPTION_ERROR_CODES = {
  EMAIL_MISMATCH: "EMAIL_MISMATCH",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
};

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

function emailsMatch(firstEmail, secondEmail) {
  return normalizeEmail(firstEmail) === normalizeEmail(secondEmail);
}

function getFirestoreErrorCode(error) {
  return typeof error?.code === "string" ? error.code : "";
}

function createRedemptionPreconditionError(code, message) {
  const error = new Error(message);
  error.name = "InvitationRedemptionPreconditionError";
  error.code = code;

  return error;
}

function createRedemptionDebugContext(invitation, firebaseUser) {
  return {
    authEmail: normalizeEmail(firebaseUser.email),
    authUid: firebaseUser.uid,
    invitationEmail: normalizeEmail(invitation.email),
    invitationPath: REDACTED_INVITATION_PATH,
    operations: [],
    phase: "initializing",
    role: invitation.role,
    schoolId: invitation.schoolId,
  };
}

function setRedemptionDebugPhase(context, phase, operations) {
  context.phase = phase;
  context.operations = operations;
}

function getRuleExpectations() {
  return SCHOOL_ADMIN_REDEMPTION_RULE_EXPECTATIONS;
}

function logRedemptionFailure(error, context) {
  console.error(
    "[Invitation redemption] Firestore operation failed.",
    {
      authEmail: context.authEmail,
      authUid: context.authUid,
      code: getFirestoreErrorCode(error),
      invitationEmail: context.invitationEmail,
      invitationPath: context.invitationPath,
      message: error?.message,
      operations: context.operations,
      phase: context.phase,
      role: context.role,
      ruleExpectations: getRuleExpectations(),
      schoolId: context.schoolId,
    },
    error,
  );
}

function logRedemptionDiagnostic(action, context, error) {
  const details = {
    authEmail: context.authEmail,
    authUid: context.authUid,
    code: error?.code,
    invitationEmail: context.invitationEmail,
    invitationPath: context.invitationPath,
    message: error?.message,
    phase: context.phase,
    role: context.role,
    schoolId: context.schoolId,
  };

  if (error) {
    console.error(`[Invitation redemption] ${action} failed.`, details, error);
    return;
  }

  console.info(`[Invitation redemption] ${action}.`, details);
}

function createRedemptionError(error, context) {
  const isPermissionDenied = getFirestoreErrorCode(error) === "permission-denied";
  const redemptionError = new Error(
    isPermissionDenied
      ? "Firestore rejected the invitation redemption transaction. Check the console for the failed redemption rule and operation."
      : error?.message ||
          "This invitation could not be redeemed. Try again in a moment.",
  );

  redemptionError.name = "InvitationRedemptionError";
  redemptionError.code = getFirestoreErrorCode(error);
  redemptionError.cause = error;
  redemptionError.redemptionContext = context;

  return redemptionError;
}

export function redeemSchoolAdminInvitation(invitation, firebaseUser) {
  return redeemInvitation(invitation, firebaseUser);
}

export async function redeemInvitation(invitation, firebaseUser) {
  if (!invitation?.id || !invitation.schoolId) {
    throw new Error("This invitation is not valid.");
  }

  if (!firebaseUser?.uid || !firebaseUser.email) {
    throw new Error("Sign in with the invited email before continuing.");
  }

  const debugContext = createRedemptionDebugContext(invitation, firebaseUser);

  logRedemptionDiagnostic("redeemInvitation start", debugContext);

  if (!emailsMatch(firebaseUser.email, invitation.email)) {
    throw createRedemptionPreconditionError(
      INVITATION_REDEMPTION_ERROR_CODES.EMAIL_MISMATCH,
      "Sign in with the email address this invitation was sent to.",
    );
  }

  if (!firebaseUser.emailVerified) {
    throw createRedemptionPreconditionError(
      INVITATION_REDEMPTION_ERROR_CODES.EMAIL_NOT_VERIFIED,
      "Verify your email address before accepting this invitation.",
    );
  }

  if (isInvitationExpired(invitation)) {
    throw new Error("This invitation has expired.");
  }

  try {
    logRedemptionDiagnostic("getIdToken(true) start", debugContext);
    await getIdToken(firebaseUser, true);
    logRedemptionDiagnostic("getIdToken(true) success", debugContext);
  } catch (error) {
    logRedemptionDiagnostic("getIdToken(true)", debugContext, error);
    throw error;
  }

  const invitationRef = doc(db, COLLECTIONS.INVITATIONS, invitation.id);
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);

  try {
    await runTransaction(db, async (transaction) => {
      setRedemptionDebugPhase(debugContext, "read invitation and invitee user", [
        {
          operation: "get",
          path: REDACTED_INVITATION_PATH,
          rule: "invitations/{invitationId} allow get",
        },
        {
          operation: "get",
          path: `${COLLECTIONS.USERS}/${firebaseUser.uid}`,
          rule: "users/{userId} allow get when request.auth.uid == userId",
        },
      ]);

      const [invitationSnapshot, userSnapshot] = await Promise.all([
        transaction.get(invitationRef),
        transaction.get(userRef),
      ]);

      if (!invitationSnapshot.exists()) {
        throw new Error("This invitation could not be found.");
      }

      const freshInvitation = {
        id: invitationSnapshot.id,
        ...invitationSnapshot.data(),
      };

      debugContext.invitationEmail = normalizeEmail(freshInvitation.email);
      debugContext.role = freshInvitation.role;
      debugContext.schoolId = freshInvitation.schoolId;

      if (!INVITATION_ROLES.has(freshInvitation.role) || !freshInvitation.schoolId) {
        throw new Error("This invitation is not valid.");
      }

      if (freshInvitation.status !== INVITATION_STATUSES.PENDING) {
        throw new Error("This invitation has already been used or cancelled.");
      }

      if (isInvitationExpired(freshInvitation)) {
        throw new Error("This invitation has expired.");
      }

      if (!emailsMatch(firebaseUser.email, freshInvitation.email)) {
        throw createRedemptionPreconditionError(
          INVITATION_REDEMPTION_ERROR_CODES.EMAIL_MISMATCH,
          "Sign in with the email address this invitation was sent to.",
        );
      }

      if (userSnapshot.exists()) {
        throw new Error("This account already has a QBank user profile.");
      }

      const schoolRef = doc(db, COLLECTIONS.SCHOOLS, freshInvitation.schoolId);
      const now = serverTimestamp();

      setRedemptionDebugPhase(
        debugContext,
        "commit invitation redemption writes",
        [
          {
            operation: "create",
            path: `${COLLECTIONS.USERS}/${firebaseUser.uid}`,
            rule: SCHOOL_ADMIN_REDEMPTION_RULE_EXPECTATIONS[0],
          },
          {
            operation: "update",
            path: `${COLLECTIONS.SCHOOLS}/${freshInvitation.schoolId}`,
            rule: SCHOOL_ADMIN_REDEMPTION_RULE_EXPECTATIONS[1],
          },
          {
            operation: "update",
            path: REDACTED_INVITATION_PATH,
            rule: SCHOOL_ADMIN_REDEMPTION_RULE_EXPECTATIONS[2],
          },
        ],
      );

      transaction.set(userRef, {
        createdAt: now,
        email: freshInvitation.email,
        invitationId: freshInvitation.id,
        name: freshInvitation.name,
        photoURL: firebaseUser.photoURL ?? null,
        role: freshInvitation.role,
        schoolId: freshInvitation.schoolId,
        status: ACCOUNT_STATUSES.ACTIVE,
        uid: firebaseUser.uid,
        updatedAt: now,
      });

      transaction.update(schoolRef, {
        adminIds: [firebaseUser.uid],
        primaryAdminId: firebaseUser.uid,
        updatedAt: now,
      });

      transaction.update(invitationRef, {
        acceptedAt: now,
        acceptedBy: firebaseUser.uid,
        status: INVITATION_STATUSES.ACCEPTED,
        updatedAt: now,
      });
    });
    logRedemptionDiagnostic("redeemInvitation success", debugContext);
  } catch (error) {
    logRedemptionFailure(error, debugContext);
    throw createRedemptionError(error, debugContext);
  }
}
