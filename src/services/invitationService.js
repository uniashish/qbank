import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { INVITATION_STATUSES } from "../constants/invitationStatus.js";
import { USER_ROLES } from "../constants/roles.js";
import { db } from "./firebase";

const INVITATIONS_COLLECTION = "invitations";
const INVITATION_TTL_DAYS = 7;
const INVITATION_ROLES = new Set([
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
]);

function normalizeInvitationSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function getInvitationExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITATION_TTL_DAYS);

  return Timestamp.fromDate(expiresAt);
}

function createSecureToken() {
  const cryptoSource = globalThis.crypto;

  if (!cryptoSource) {
    throw new Error("Secure token generation is not available.");
  }

  if (typeof cryptoSource.randomUUID === "function") {
    return cryptoSource.randomUUID();
  }

  const bytes = new Uint8Array(32);
  cryptoSource.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

export function isInvitationExpired(invitation) {
  const expiresAt = toDate(invitation?.expiresAt);

  return Boolean(expiresAt && expiresAt.getTime() <= Date.now());
}

export function getInvitationUrl(token) {
  return `${window.location.origin}/invite/${token}`;
}

export async function getInvitationByToken(token) {
  if (!token) {
    return null;
  }

  const invitationRef = doc(db, INVITATIONS_COLLECTION, token);
  const invitationSnapshot = await getDoc(invitationRef);

  if (!invitationSnapshot.exists()) {
    return null;
  }

  return normalizeInvitationSnapshot(invitationSnapshot);
}

export async function getInvitationsForSchoolByRole(schoolId, role) {
  if (!schoolId || !INVITATION_ROLES.has(role)) {
    return [];
  }

  const invitationsRef = collection(db, INVITATIONS_COLLECTION);
  const invitationsQuery = query(
    invitationsRef,
    where("schoolId", "==", schoolId),
    where("role", "==", role),
    limit(100),
  );
  const invitationsSnapshot = await getDocs(invitationsQuery);

  return invitationsSnapshot.docs
    .map(normalizeInvitationSnapshot)
    .sort((firstInvitation, secondInvitation) => {
      const firstTime = toDate(firstInvitation.createdAt)?.getTime() ?? 0;
      const secondTime = toDate(secondInvitation.createdAt)?.getTime() ?? 0;

      return secondTime - firstTime;
    });
}

export async function getPendingInvitationByRole(schoolId, role, email) {
  if (!schoolId) {
    return null;
  }

  const normalizedEmail = email?.trim().toLowerCase();
  const invitations = await getInvitationsForSchoolByRole(schoolId, role);

  return (
    invitations.find(
      (invitation) =>
        invitation.status === INVITATION_STATUSES.PENDING &&
        (!normalizedEmail || invitation.email === normalizedEmail) &&
        !isInvitationExpired(invitation),
    ) ?? null
  );
}

export function getPendingSchoolAdminInvitation(schoolId, email) {
  return getPendingInvitationByRole(schoolId, USER_ROLES.SCHOOL_ADMIN, email);
}

export async function createInvitation({
  email,
  invitedByUid,
  name,
  role,
  schoolId,
  schoolName,
}) {
  if (!INVITATION_ROLES.has(role)) {
    throw new Error("Choose a supported invitation role.");
  }

  if (!schoolId) {
    throw new Error("Select a valid school before creating an invitation.");
  }

  const token = createSecureToken();
  const invitationRef = doc(db, INVITATIONS_COLLECTION, token);
  const expiresAt = getInvitationExpiry();
  const invitationPayload = {
    acceptedAt: null,
    acceptedBy: null,
    createdAt: serverTimestamp(),
    email: email.trim().toLowerCase(),
    expiresAt,
    invitedBy: invitedByUid,
    name: name.trim(),
    role,
    schoolId,
    status: INVITATION_STATUSES.PENDING,
    token,
    updatedAt: serverTimestamp(),
  };

  if (schoolName) {
    invitationPayload.schoolName = schoolName;
  }

  await setDoc(invitationRef, invitationPayload);

  return {
    id: token,
    ...invitationPayload,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createSchoolAdminInvitation({
  email,
  invitedByUid,
  name,
  school,
}) {
  if (!school?.id) {
    throw new Error("Select a valid school before creating an invitation.");
  }

  if (school.primaryAdminId) {
    throw new Error("This school already has a primary School Admin.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existingSchoolInvitation = await getPendingSchoolAdminInvitation(
    school.id,
  );

  if (existingSchoolInvitation) {
    throw new Error(
      existingSchoolInvitation.email === normalizedEmail
        ? "A pending invitation already exists for this school and email."
        : "A pending School Admin invitation already exists for this school.",
    );
  }

  const invitation = await createInvitation({
    email: normalizedEmail,
    invitedByUid,
    name,
    role: USER_ROLES.SCHOOL_ADMIN,
    schoolId: school.id,
    schoolName: school.name,
  });

  return {
    ...invitation,
    schoolName: school.name,
  };
}

export function cancelInvitation(invitationId) {
  const invitationRef = doc(db, INVITATIONS_COLLECTION, invitationId);

  return updateDoc(invitationRef, {
    status: INVITATION_STATUSES.CANCELLED,
    updatedAt: serverTimestamp(),
  });
}
