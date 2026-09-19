import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { USER_ROLES } from "../../constants/roles.js";
import { getClassSubjectMappingId } from "../../services/classSubjectService.js";
import { db } from "../../services/firebase.js";
import {
  getAssignableClassSubjects,
  getTeacherAssignmentId,
} from "../../services/teacherAssignmentService.js";

const COLLECTIONS = {
  JOIN_REQUESTS: "joinRequests",
  SCHOOLS: "schools",
  TEACHER_ASSIGNMENTS: "teacherAssignments",
  USERS: "users",
};

export const JOIN_REQUEST_STATUSES = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
};

function normalizeUserSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    uid: data.uid ?? snapshot.id,
  };
}

function normalizeJoinRequestSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
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

function sortByName(records) {
  return [...records].sort((firstRecord, secondRecord) =>
    (firstRecord.name || firstRecord.email || "").localeCompare(
      secondRecord.name || secondRecord.email || "",
    ),
  );
}

function getJoinRequestsCollectionRef(schoolId) {
  return collection(
    db,
    COLLECTIONS.SCHOOLS,
    schoolId,
    COLLECTIONS.JOIN_REQUESTS,
  );
}

function getJoinRequestDocRef(schoolId, userId) {
  return doc(getJoinRequestsCollectionRef(schoolId), userId);
}

function getTeacherAssignmentDocRef(schoolId, teacherId, classId, subjectId) {
  return doc(
    db,
    COLLECTIONS.SCHOOLS,
    schoolId,
    COLLECTIONS.TEACHER_ASSIGNMENTS,
    getTeacherAssignmentId(teacherId, classId, subjectId),
  );
}

function normalizeSelections(selections) {
  const normalizedSelections = [];
  const pairIds = new Set();

  Object.entries(selections ?? {}).forEach(([classId, subjectIds]) => {
    [...new Set(subjectIds ?? [])].forEach((subjectId) => {
      if (!classId || !subjectId) {
        return;
      }

      const pairId = getClassSubjectMappingId(classId, subjectId);

      if (pairIds.has(pairId)) {
        return;
      }

      pairIds.add(pairId);
      normalizedSelections.push({ classId, subjectId });
    });
  });

  return normalizedSelections;
}

async function validateAssignmentSelections(schoolId, selections) {
  const assignablePairs = await getAssignableClassSubjects(schoolId);
  const assignablePairIds = new Set(assignablePairs.map((pair) => pair.id));
  const normalizedSelections = normalizeSelections(selections);

  normalizedSelections.forEach((selection) => {
    const pairId = getClassSubjectMappingId(
      selection.classId,
      selection.subjectId,
    );

    if (!assignablePairIds.has(pairId)) {
      throw new Error("Assignments can only use active class-subject mappings.");
    }
  });

  return normalizedSelections;
}

async function getActiveSchoolAdminIds(schoolId) {
  const usersRef = collection(db, COLLECTIONS.USERS);
  const adminsQuery = query(
    usersRef,
    where("schoolId", "==", schoolId),
    where("role", "==", USER_ROLES.SCHOOL_ADMIN),
    where("status", "==", ACCOUNT_STATUSES.ACTIVE),
    limit(100),
  );
  const adminsSnapshot = await getDocs(adminsQuery);

  return adminsSnapshot.docs.map((snapshot) => snapshot.id);
}

export async function getPendingJoinRequestsForSchool(schoolId) {
  if (!schoolId) {
    return [];
  }

  const requestsQuery = query(
    getJoinRequestsCollectionRef(schoolId),
    where("status", "==", JOIN_REQUEST_STATUSES.PENDING),
    limit(100),
  );
  const requestsSnapshot = await getDocs(requestsQuery);

  return sortByCreatedAtDescending(
    requestsSnapshot.docs.map(normalizeJoinRequestSnapshot),
  );
}

export async function getActiveTeachersForSchool(schoolId) {
  return getActiveUsersForSchool(schoolId, USER_ROLES.TEACHER);
}

export async function getActiveSchoolAdminsForSchool(schoolId) {
  return getActiveUsersForSchool(schoolId, USER_ROLES.SCHOOL_ADMIN);
}

async function getActiveUsersForSchool(schoolId, role) {
  if (!schoolId) {
    return [];
  }

  const usersRef = collection(db, COLLECTIONS.USERS);
  const usersQuery = query(
    usersRef,
    where("schoolId", "==", schoolId),
    where("role", "==", role),
    where("status", "==", ACCOUNT_STATUSES.ACTIVE),
    limit(100),
  );
  const usersSnapshot = await getDocs(usersQuery);

  return sortByName(usersSnapshot.docs.map(normalizeUserSnapshot));
}

export async function approveJoinRequest({
  assignments,
  reviewedBy,
  schoolId,
  userId,
}) {
  const normalizedAssignments = await validateAssignmentSelections(
    schoolId,
    assignments,
  );
  const requestRef = getJoinRequestDocRef(schoolId, userId);
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const timestamp = serverTimestamp();

  await runTransaction(db, async (transaction) => {
    const [requestSnapshot, userSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(userRef),
    ]);

    if (!requestSnapshot.exists()) {
      throw new Error("This join request could not be found.");
    }

    const request = requestSnapshot.data();

    if (
      request.status !== JOIN_REQUEST_STATUSES.PENDING ||
      request.requestedRole !== USER_ROLES.TEACHER
    ) {
      throw new Error("This join request is no longer pending.");
    }

    if (!userSnapshot.exists()) {
      throw new Error("The pending teacher profile could not be found.");
    }

    const userProfile = userSnapshot.data();

    if (
      userProfile.role !== USER_ROLES.TEACHER ||
      userProfile.schoolId !== schoolId ||
      userProfile.status !== ACCOUNT_STATUSES.PENDING_APPROVAL
    ) {
      throw new Error("This account is not pending approval for this school.");
    }

    transaction.update(userRef, {
      status: ACCOUNT_STATUSES.ACTIVE,
      updatedAt: timestamp,
    });

    normalizedAssignments.forEach((assignment) => {
      transaction.set(
        getTeacherAssignmentDocRef(
          schoolId,
          userId,
          assignment.classId,
          assignment.subjectId,
        ),
        {
          classId: assignment.classId,
          createdAt: timestamp,
          createdBy: reviewedBy,
          status: "active",
          subjectId: assignment.subjectId,
          teacherId: userId,
          updatedAt: timestamp,
        },
      );
    });

    transaction.update(requestRef, {
      reviewedAt: timestamp,
      reviewedBy,
      status: JOIN_REQUEST_STATUSES.APPROVED,
      updatedAt: timestamp,
    });
  });
}

export async function rejectJoinRequest({ reviewedBy, schoolId, userId }) {
  const requestRef = getJoinRequestDocRef(schoolId, userId);
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const timestamp = serverTimestamp();

  await runTransaction(db, async (transaction) => {
    const [requestSnapshot, userSnapshot] = await Promise.all([
      transaction.get(requestRef),
      transaction.get(userRef),
    ]);

    if (!requestSnapshot.exists()) {
      throw new Error("This join request could not be found.");
    }

    const request = requestSnapshot.data();

    if (request.status !== JOIN_REQUEST_STATUSES.PENDING) {
      throw new Error("This join request is no longer pending.");
    }

    if (!userSnapshot.exists()) {
      throw new Error("The pending teacher profile could not be found.");
    }

    transaction.update(userRef, {
      status: ACCOUNT_STATUSES.DISABLED,
      updatedAt: timestamp,
    });

    transaction.update(requestRef, {
      reviewedAt: timestamp,
      reviewedBy,
      status: JOIN_REQUEST_STATUSES.REJECTED,
      updatedAt: timestamp,
    });
  });
}

export async function changeSchoolUserRole({
  actorUid,
  nextRole,
  schoolId,
  userId,
}) {
  if (!actorUid) {
    throw new Error("A reviewer account is required.");
  }

  if (![USER_ROLES.SCHOOL_ADMIN, USER_ROLES.TEACHER].includes(nextRole)) {
    throw new Error("Choose a supported role.");
  }

  const activeAdminIds = await getActiveSchoolAdminIds(schoolId);
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  const schoolRef = doc(db, COLLECTIONS.SCHOOLS, schoolId);
  const timestamp = serverTimestamp();

  await runTransaction(db, async (transaction) => {
    const [userSnapshot, schoolSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(schoolRef),
    ]);

    if (!userSnapshot.exists()) {
      throw new Error("This user could not be found.");
    }

    if (!schoolSnapshot.exists()) {
      throw new Error("The linked school could not be found.");
    }

    const userProfile = userSnapshot.data();

    if (
      userProfile.schoolId !== schoolId ||
      userProfile.status !== ACCOUNT_STATUSES.ACTIVE ||
      ![USER_ROLES.SCHOOL_ADMIN, USER_ROLES.TEACHER].includes(userProfile.role)
    ) {
      throw new Error("Choose an active user from your school.");
    }

    if (userProfile.role === nextRole) {
      return;
    }

    const school = schoolSnapshot.data();
    const schoolAdminIds = Array.isArray(school.adminIds)
      ? school.adminIds.filter(Boolean)
      : [];
    const currentAdminIds = new Set(
      schoolAdminIds.length > 0 ? schoolAdminIds : activeAdminIds,
    );

    if (userProfile.role === USER_ROLES.SCHOOL_ADMIN) {
      currentAdminIds.add(userId);
    }

    if (nextRole === USER_ROLES.SCHOOL_ADMIN) {
      currentAdminIds.add(userId);
    } else {
      currentAdminIds.delete(userId);
    }

    const nextAdminIds = [...currentAdminIds].sort();

    if (nextAdminIds.length === 0) {
      throw new Error("A school must have at least one active School Admin.");
    }

    const nextPrimaryAdminId = nextAdminIds.includes(school.primaryAdminId)
      ? school.primaryAdminId
      : nextAdminIds[0];

    transaction.update(userRef, {
      role: nextRole,
      updatedAt: timestamp,
    });

    transaction.update(schoolRef, {
      adminIds: nextAdminIds,
      primaryAdminId: nextPrimaryAdminId,
      updatedAt: timestamp,
    });
  });
}
