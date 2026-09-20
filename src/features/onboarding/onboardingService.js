import { getIdToken, getIdTokenResult, reload } from "firebase/auth";
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
import { auth, db } from "../../services/firebase.js";

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

function ensureSameAuthenticatedUser(firebaseUser) {
  ensureAuthenticatedUser(firebaseUser);

  if (!auth.currentUser || auth.currentUser.uid !== firebaseUser.uid) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.MISSING_AUTH_USER,
      "Sign in with the account you verified before continuing.",
    );
  }

  return auth.currentUser;
}

function ensureVerifiedEmailClaim(tokenResult) {
  if (tokenResult?.claims?.email_verified !== true) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.EMAIL_NOT_VERIFIED,
      "Verify your email address before continuing.",
    );
  }
}

function isGoogleTokenResult(tokenResult) {
  return (
    tokenResult?.signInProvider === GOOGLE_PROVIDER_ID ||
    tokenResult?.claims?.firebase?.sign_in_provider === GOOGLE_PROVIDER_ID
  );
}

async function requireSchoolCreationUser(firebaseUser) {
  const currentUser = ensureSameAuthenticatedUser(firebaseUser);
  const currentTokenResult = await getIdTokenResult(currentUser, true);

  if (isGoogleTokenResult(currentTokenResult)) {
    return currentUser;
  }

  await reload(currentUser);

  if (!currentUser.emailVerified) {
    throw createOnboardingError(
      ONBOARDING_ERROR_CODES.EMAIL_NOT_VERIFIED,
      "Verify your email address before continuing.",
    );
  }

  const tokenResult = await getIdTokenResult(currentUser, true);

  ensureVerifiedEmailClaim(tokenResult);

  return currentUser;
}

function isCompletedSchoolAdminProfile(userData, firebaseUser) {
  return Boolean(
    userData?.uid === firebaseUser.uid &&
      userData?.email === normalizeEmail(firebaseUser.email) &&
      userData?.role === USER_ROLES.SCHOOL_ADMIN &&
      userData?.status === ACCOUNT_STATUSES.ACTIVE &&
      typeof userData?.schoolId === "string" &&
      userData.schoolId.trim(),
  );
}

function isCompletedSchoolAdminSchool(schoolData, firebaseUser) {
  return Boolean(
    schoolData?.primaryAdminId === firebaseUser.uid &&
      Array.isArray(schoolData?.adminIds) &&
      schoolData.adminIds.includes(firebaseUser.uid),
  );
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
  return Boolean(firebaseUser?.emailVerified === true || isGoogleUser(firebaseUser));
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
  const schoolCreationUser = await requireSchoolCreationUser(firebaseUser);

  const schoolRef = doc(collection(db, COLLECTIONS.SCHOOLS));
  const userRef = doc(db, COLLECTIONS.USERS, schoolCreationUser.uid);
  const timestamp = serverTimestamp();

  return runTransaction(db, async (transaction) => {
    const userSnapshot = await transaction.get(userRef);

    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();

      if (isCompletedSchoolAdminProfile(userData, schoolCreationUser)) {
        const existingSchoolRef = doc(db, COLLECTIONS.SCHOOLS, userData.schoolId);
        const existingSchoolSnapshot = await transaction.get(existingSchoolRef);

        if (
          existingSchoolSnapshot.exists() &&
          isCompletedSchoolAdminSchool(
            existingSchoolSnapshot.data(),
            schoolCreationUser,
          )
        ) {
          return userData.schoolId;
        }
      }

      throw createOnboardingError(
        ONBOARDING_ERROR_CODES.ACCOUNT_ALREADY_PROVISIONED,
        "This account already has a QBank user profile.",
      );
    }

    transaction.set(schoolRef, {
      address: school.address,
      adminIds: [schoolCreationUser.uid],
      allowJoinRequests: true,
      city: school.city,
      code: school.code,
      country: school.country,
      createdAt: timestamp,
      createdBy: schoolCreationUser.uid,
      email: school.email,
      name: school.name,
      phone: school.phone,
      primaryAdminId: schoolCreationUser.uid,
      status: SCHOOL_STATUSES.ACTIVE,
      updatedAt: timestamp,
    });

    transaction.set(userRef, {
      createdAt: timestamp,
      email: normalizeEmail(schoolCreationUser.email),
      name: getDisplayName(schoolCreationUser, adminName),
      photoURL: schoolCreationUser.photoURL ?? null,
      role: USER_ROLES.SCHOOL_ADMIN,
      schoolId: schoolRef.id,
      status: ACCOUNT_STATUSES.ACTIVE,
      uid: schoolCreationUser.uid,
      updatedAt: timestamp,
    });

    return schoolRef.id;
  });
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
