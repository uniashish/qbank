import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { USER_ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import { db } from "./firebase";

const SCHOOLS_COLLECTION = "schools";
const JOIN_REQUESTS_COLLECTION = "joinRequests";
const USERS_COLLECTION = "users";

export const JOIN_REQUEST_STATUSES = {
  APPROVED: "approved",
  PENDING: "pending",
  REJECTED: "rejected",
};

function getJoinRequestsCollectionRef(schoolId) {
  return collection(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    JOIN_REQUESTS_COLLECTION,
  );
}

function getJoinRequestDocRef(schoolId, userId) {
  return doc(getJoinRequestsCollectionRef(schoolId), userId);
}

function normalizeJoinRequestSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export async function getJoinRequestsForSchool(schoolId) {
  if (!schoolId) {
    return [];
  }

  const requestsQuery = query(
    getJoinRequestsCollectionRef(schoolId),
    orderBy("createdAt", "desc"),
  );
  const requestsSnapshot = await getDocs(requestsQuery);

  return requestsSnapshot.docs.map(normalizeJoinRequestSnapshot);
}

export async function approveJoinRequest({ reviewedBy, schoolId, userId }) {
  return reviewJoinRequest({
    nextUserStatus: ACCOUNT_STATUSES.ACTIVE,
    reviewedBy,
    schoolId,
    status: JOIN_REQUEST_STATUSES.APPROVED,
    userId,
  });
}

export async function rejectJoinRequest({ reviewedBy, schoolId, userId }) {
  return reviewJoinRequest({
    nextUserStatus: ACCOUNT_STATUSES.DISABLED,
    reviewedBy,
    schoolId,
    status: JOIN_REQUEST_STATUSES.REJECTED,
    userId,
  });
}

async function reviewJoinRequest({
  nextUserStatus,
  reviewedBy,
  schoolId,
  status,
  userId,
}) {
  if (!schoolId || !userId) {
    throw new Error("Choose a valid join request.");
  }

  const requestRef = getJoinRequestDocRef(schoolId, userId);
  const userRef = doc(db, USERS_COLLECTION, userId);
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

    transaction.update(requestRef, {
      reviewedAt: timestamp,
      reviewedBy,
      status,
      updatedAt: timestamp,
    });

    transaction.update(userRef, {
      status: nextUserStatus,
      updatedAt: timestamp,
    });
  });
}
