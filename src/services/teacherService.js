import { collection, getDocs, limit, query, where } from "firebase/firestore";

import { INVITATION_STATUSES } from "../constants/invitationStatus.js";
import { USER_ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import { db } from "./firebase";
import {
  cancelInvitation,
  createInvitation,
  getInvitationsForSchoolByRole,
  getPendingInvitationByRole,
} from "./invitationService.js";

const USERS_COLLECTION = "users";

function normalizeEmail(email) {
  return email?.trim().toLowerCase() ?? "";
}

function normalizeTeacherSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    uid: data.uid ?? snapshot.id,
  };
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

function sortByCreatedAtDescending(records) {
  return [...records].sort((firstRecord, secondRecord) => {
    const firstTime = toDate(firstRecord.createdAt)?.getTime() ?? 0;
    const secondTime = toDate(secondRecord.createdAt)?.getTime() ?? 0;

    return secondTime - firstTime;
  });
}

export async function getTeachersForSchool(schoolId) {
  if (!schoolId) {
    return [];
  }

  const usersRef = collection(db, USERS_COLLECTION);
  const teachersQuery = query(
    usersRef,
    where("schoolId", "==", schoolId),
    where("role", "==", USER_ROLES.TEACHER),
    limit(100),
  );
  const teachersSnapshot = await getDocs(teachersQuery);
  const teachers = teachersSnapshot.docs.map(normalizeTeacherSnapshot);

  return sortByCreatedAtDescending(teachers);
}

export async function getTeacherInvitationsForSchool(schoolId) {
  const invitations = await getInvitationsForSchoolByRole(
    schoolId,
    USER_ROLES.TEACHER,
  );

  return invitations.filter((invitation) =>
    [
      INVITATION_STATUSES.ACCEPTED,
      INVITATION_STATUSES.CANCELLED,
      INVITATION_STATUSES.PENDING,
    ].includes(invitation.status),
  );
}

export async function getActiveTeacherByEmail(schoolId, email) {
  if (!schoolId || !email) {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);
  const usersRef = collection(db, USERS_COLLECTION);
  const teachersQuery = query(
    usersRef,
    where("schoolId", "==", schoolId),
    where("role", "==", USER_ROLES.TEACHER),
    where("email", "==", normalizedEmail),
    where("status", "==", ACCOUNT_STATUSES.ACTIVE),
    limit(1),
  );
  const teachersSnapshot = await getDocs(teachersQuery);
  const teacherSnapshot = teachersSnapshot.docs[0];

  return teacherSnapshot ? normalizeTeacherSnapshot(teacherSnapshot) : null;
}

export async function createTeacherInvitation({
  email,
  invitedByUid,
  name,
  schoolId,
}) {
  if (!schoolId) {
    throw new Error("No school is linked to this account.");
  }

  const normalizedEmail = normalizeEmail(email);
  const existingTeacher = await getActiveTeacherByEmail(schoolId, normalizedEmail);

  if (existingTeacher) {
    throw new Error("An active teacher already exists for this email.");
  }

  const existingInvitation = await getPendingInvitationByRole(
    schoolId,
    USER_ROLES.TEACHER,
    normalizedEmail,
  );

  if (existingInvitation) {
    throw new Error("A pending teacher invitation already exists for this email.");
  }

  return createInvitation({
    email: normalizedEmail,
    invitedByUid,
    name,
    role: USER_ROLES.TEACHER,
    schoolId,
  });
}

export function cancelTeacherInvitation(invitationId) {
  return cancelInvitation(invitationId);
}
