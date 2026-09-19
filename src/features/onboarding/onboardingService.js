import { getIdToken } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { USER_ROLES } from "../../constants/roles.js";
import { SCHOOL_STATUSES } from "../../constants/schoolStatus.js";
import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { db } from "../../services/firebase.js";

const COLLECTIONS = {
  JOIN_REQUESTS: "joinRequests",
  SCHOOLS: "schools",
  USERS: "users",
};

const GOOGLE_PROVIDER_ID = "google.com";

export const JOIN_REQUEST_STATUSES = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
};

export const ONBOARDING_ERROR_CODES = {
  ACCOUNT_ALREADY_PROVISIONED: "ACCOUNT_ALREADY_PROVISIONED",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  MISSING_AUTH_USER: "MISSING_AUTH_USER",
  SCHOOL_NOT_ACCEPTING_JOIN_REQUESTS: "SCHOOL_NOT_ACCEPTING_JOIN_REQUESTS",
  DUPLICATE_JOIN_REQUEST: "DUPLICATE_JOIN_REQUEST",
  USER_ALREADY_LINKED: "USER_ALREADY_LINKED",
};

function createOnboardingError(code, message) {
  const error = new Error(message);
  error.name = "OnboardingError";
  error.code = code;

  return error;
}

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

function getDisplayName(firebaseUser, fallbackName) {
  return (
    fallbackName?.trim() ||
    firebaseUser?.displayName?.trim() ||
    firebaseUser?.email?.split("@")[0] ||
    "QBank user"
  );
}

function ensureAuthenticatedUser(firebaseUser) {
  if (!firebaseUser?.uid || !firebaseUser.email) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.MISSING_AUTH_USER,
      "Sign in before continuing.",
    );
  }
}

function ensureVerifiedOrGoogleUser(firebaseUser) {
  ensureAuthenticatedUser(firebaseUser);

  if (!isVerifiedOrGoogleUser(firebaseUser)) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.EMAIL_NOT_VERIFIED,
      "Verify your email address before continuing.",
    );
  }
}

function getJoinRequestId(schoolId, uid) {
  return `${schoolId}:${uid}`;
}

export function isGoogleUser(firebaseUser) {
  return Boolean(
    firebaseUser?.providerData?.some(
      (provider) => provider.providerId === GOOGLE_PROVIDER_ID,
    ),
  );
}

export function isVerifiedOrGoogleUser(firebaseUser) {
  return Boolean(firebaseUser?.emailVerified || isGoogleUser(firebaseUser));
}

export async function findSchoolByExactName(schoolName) {
  const response = await fetch("/api/find-school", {
    body: JSON.stringify({ schoolName }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "School lookup failed. Try again in a moment.");
  }

  return payload.school ?? null;
}

export async function getCurrentJoinRequestForSchool(schoolId, userId) {
  if (!schoolId || !userId) {
    return null;
  }

  const requestRef = doc(
    db,
    COLLECTIONS.SCHOOLS,
    schoolId,
    COLLECTIONS.JOIN_REQUESTS,
    userId,
  );
  const requestSnapshot = await getDoc(requestRef);

  if (!requestSnapshot.exists()) {
    return null;
  }

  return {
    id: requestSnapshot.id,
    ...requestSnapshot.data(),
  };
}

export async function createSchoolAdminOnboardingProfile({
  adminName,
  firebaseUser,
  school,
}) {
  ensureVerifiedOrGoogleUser(firebaseUser);
  await getIdToken(firebaseUser, true);

  const schoolRef = doc(collection(db, COLLECTIONS.SCHOOLS));
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
  const timestamp = serverTimestamp();

  await runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);

    if (userSnapshot.exists()) {
      throw createOnboardingError(
        ONBOARDING_ERROR_CODES.ACCOUNT_ALREADY_PROVISIONED,
        "This account already has a QBank user profile.",
      );
    }

    transaction.set(schoolRef, {
      address: school.address,
      adminIds: [firebaseUser.uid],
      allowJoinRequests: true,
      city: school.city,
      code: school.code,
      country: school.country,
      createdAt: timestamp,
      createdBy: firebaseUser.uid,
      email: school.email,
      name: school.name,
      phone: school.phone,
      primaryAdminId: firebaseUser.uid,
      status: SCHOOL_STATUSES.ACTIVE,
      updatedAt: timestamp,
    });

    transaction.set(userRef, {
      createdAt: timestamp,
      email: normalizeEmail(firebaseUser.email),
      name: getDisplayName(firebaseUser, adminName),
      photoURL: firebaseUser.photoURL ?? null,
      role: USER_ROLES.SCHOOL_ADMIN,
      schoolId: schoolRef.id,
      status: ACCOUNT_STATUSES.ACTIVE,
      uid: firebaseUser.uid,
      updatedAt: timestamp,
    });
  });

  return schoolRef.id;
}

export async function createSchoolJoinRequest({
  firebaseUser,
  requesterName,
  school,
}) {
  ensureVerifiedOrGoogleUser(firebaseUser);

  if (school.allowJoinRequests === false) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.SCHOOL_NOT_ACCEPTING_JOIN_REQUESTS,
      "This school is not accepting join requests.",
    );
  }

  await getIdToken(firebaseUser, true);

  const requestRef = doc(
    db,
    COLLECTIONS.SCHOOLS,
    school.id,
    COLLECTIONS.JOIN_REQUESTS,
    firebaseUser.uid,
  );
  const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
  const timestamp = serverTimestamp();
  const displayName = getDisplayName(firebaseUser, requesterName);
  const normalizedEmail = normalizeEmail(firebaseUser.email);

  await runTransaction(db, async (transaction) => {
    const [requestSnapshot, userSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(userRef),
    ]);

    if (requestSnapshot.exists()) {
      const requestData = requestSnapshot.data();

      if (requestData.status === JOIN_REQUEST_STATUSES.PENDING) {
        throw createOnboardingError(
          ONBOARDING_ERROR_CODES.DUPLICATE_JOIN_REQUEST,
          "A pending join request already exists for this school.",
        );
      }

      throw createOnboardingError(
        ONBOARDING_ERROR_CODES.USER_ALREADY_LINKED,
        "This account already has a join request for this school.",
      );
    }

    if (userSnapshot.exists()) {
      throw createOnboardingError(
        ONBOARDING_ERROR_CODES.USER_ALREADY_LINKED,
        "This account already belongs to a school or has a pending request.",
      );
    }

    transaction.set(requestRef, {
      createdAt: timestamp,
      email: normalizedEmail,
      name: displayName,
      requestedRole: USER_ROLES.TEACHER,
      reviewedAt: null,
      reviewedBy: null,
      status: JOIN_REQUEST_STATUSES.PENDING,
      updatedAt: timestamp,
      userId: firebaseUser.uid,
    });

    transaction.set(userRef, {
      createdAt: timestamp,
      email: normalizedEmail,
      name: displayName,
      photoURL: firebaseUser.photoURL ?? null,
      role: USER_ROLES.TEACHER,
      schoolId: school.id,
      status: ACCOUNT_STATUSES.PENDING_APPROVAL,
      uid: firebaseUser.uid,
      updatedAt: timestamp,
    });
  });

  return getJoinRequestId(school.id, firebaseUser.uid);
}
