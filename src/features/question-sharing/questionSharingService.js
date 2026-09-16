import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { USER_ROLES } from "../../constants/roles.js";
import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { db } from "../../services/firebase.js";

const USERS_COLLECTION = "users";
const SCHOOLS_COLLECTION = "schools";
const QUESTIONS_COLLECTION = "questions";
const QUESTION_SHARES_COLLECTION = "questionShares";
const ACTIVE_STATUS = "active";
const REVOKED_STATUS = "revoked";
const WRITE_BATCH_LIMIT = 450;
const SHARE_ID_SEPARATOR = "__";

function createQuestionSharingError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function normalizeIdList(ids = []) {
  return [...new Set(ids.filter(Boolean))];
}

function getQuestionSharesCollectionRef(schoolId) {
  if (!schoolId) {
    throw createQuestionSharingError(
      "MISSING_SCHOOL",
      "No school is linked to this account.",
    );
  }

  return collection(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    QUESTION_SHARES_COLLECTION,
  );
}

function getQuestionShareDocRef(schoolId, shareId) {
  return doc(getQuestionSharesCollectionRef(schoolId), shareId);
}

function getQuestionDocRef(schoolId, questionId) {
  return doc(db, SCHOOLS_COLLECTION, schoolId, QUESTIONS_COLLECTION, questionId);
}

function getUserDocRef(userId) {
  return doc(db, USERS_COLLECTION, userId);
}

function normalizeShareSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function normalizeTeacherSnapshot(snapshot) {
  const data = snapshot.data();

  return {
    ...data,
    uid: data.uid ?? snapshot.id,
  };
}

function sortTeachersByName(firstTeacher, secondTeacher) {
  return (firstTeacher.name ?? "").localeCompare(secondTeacher.name ?? "");
}

async function commitShareWrites(writes) {
  for (let index = 0; index < writes.length; index += WRITE_BATCH_LIMIT) {
    const batch = writeBatch(db);

    writes.slice(index, index + WRITE_BATCH_LIMIT).forEach((write) => {
      batch.set(write.ref, write.data);
    });

    await batch.commit();
  }
}

async function assertShareableQuestions({ ownerId, questionIds, schoolId }) {
  const questionSnapshots = await Promise.all(
    questionIds.map((questionId) => getDoc(getQuestionDocRef(schoolId, questionId))),
  );

  questionSnapshots.forEach((questionSnapshot, index) => {
    const questionId = questionIds[index];
    const question = questionSnapshot.data();

    if (
      !questionSnapshot.exists() ||
      question?.status !== ACTIVE_STATUS ||
      question?.createdBy?.uid !== ownerId
    ) {
      throw createQuestionSharingError(
        "UNSHAREABLE_QUESTION",
        "Only your own active questions can be shared.",
      );
    }

    if (!questionId) {
      throw createQuestionSharingError(
        "MISSING_QUESTION",
        "Choose at least one question before sharing.",
      );
    }
  });
}

async function assertRecipientTeachers({ recipientTeacherIds, schoolId }) {
  const recipientSnapshots = await Promise.all(
    recipientTeacherIds.map((teacherId) => getDoc(getUserDocRef(teacherId))),
  );

  recipientSnapshots.forEach((recipientSnapshot) => {
    const recipient = recipientSnapshot.data();

    if (
      !recipientSnapshot.exists() ||
      recipient?.role !== USER_ROLES.TEACHER ||
      recipient?.status !== ACCOUNT_STATUSES.ACTIVE ||
      recipient?.schoolId !== schoolId
    ) {
      throw createQuestionSharingError(
        "INVALID_RECIPIENT",
        "Questions can only be shared with active teachers in your school.",
      );
    }
  });
}

export function getQuestionShareId(questionId, teacherId) {
  return [questionId, teacherId].join(SHARE_ID_SEPARATOR);
}

export async function getActiveTeachersForSharing({
  currentTeacherId,
  schoolId,
}) {
  if (!schoolId) {
    return [];
  }

  const teachersQuery = query(
    collection(db, USERS_COLLECTION),
    where("schoolId", "==", schoolId),
    where("role", "==", USER_ROLES.TEACHER),
    where("status", "==", ACCOUNT_STATUSES.ACTIVE),
  );
  const teachersSnapshot = await getDocs(teachersQuery);

  return teachersSnapshot.docs
    .map(normalizeTeacherSnapshot)
    .filter((teacher) => teacher.uid !== currentTeacherId)
    .sort(sortTeachersByName);
}

export async function getQuestionSharesForOwner({ ownerId, schoolId }) {
  if (!ownerId || !schoolId) {
    return [];
  }

  const sharesQuery = query(
    getQuestionSharesCollectionRef(schoolId),
    where("ownerId", "==", ownerId),
  );
  const sharesSnapshot = await getDocs(sharesQuery);

  return sharesSnapshot.docs.map(normalizeShareSnapshot);
}

export async function getActiveQuestionSharesForOwner({ ownerId, schoolId }) {
  const shares = await getQuestionSharesForOwner({ ownerId, schoolId });

  return shares.filter((share) => share.status === ACTIVE_STATUS);
}

export async function getQuestionSharesForRecipient({ schoolId, teacherId }) {
  if (!schoolId || !teacherId) {
    return [];
  }

  const sharesQuery = query(
    getQuestionSharesCollectionRef(schoolId),
    where("sharedWithTeacherId", "==", teacherId),
  );
  const sharesSnapshot = await getDocs(sharesQuery);

  return sharesSnapshot.docs.map(normalizeShareSnapshot);
}

export async function getActiveQuestionSharesForRecipient({
  schoolId,
  teacherId,
}) {
  const shares = await getQuestionSharesForRecipient({ schoolId, teacherId });

  return shares.filter((share) => share.status === ACTIVE_STATUS);
}

export async function shareQuestions({
  ownerId,
  questionIds,
  recipientTeacherIds,
  schoolId,
}) {
  const normalizedQuestionIds = normalizeIdList(questionIds);
  const normalizedRecipientTeacherIds = normalizeIdList(
    recipientTeacherIds,
  ).filter((teacherId) => teacherId !== ownerId);

  if (!ownerId) {
    throw createQuestionSharingError(
      "MISSING_OWNER",
      "Your teacher profile could not be verified.",
    );
  }

  if (normalizedQuestionIds.length === 0) {
    throw createQuestionSharingError(
      "MISSING_QUESTIONS",
      "Choose at least one question before sharing.",
    );
  }

  if (normalizedRecipientTeacherIds.length === 0) {
    throw createQuestionSharingError(
      "MISSING_RECIPIENTS",
      "Choose at least one teacher before sharing.",
    );
  }

  await Promise.all([
    assertShareableQuestions({
      ownerId,
      questionIds: normalizedQuestionIds,
      schoolId,
    }),
    assertRecipientTeachers({
      recipientTeacherIds: normalizedRecipientTeacherIds,
      schoolId,
    }),
  ]);

  const shareTargets = normalizedQuestionIds.flatMap((questionId) =>
    normalizedRecipientTeacherIds.map((teacherId) => {
      const shareId = getQuestionShareId(questionId, teacherId);

      return {
        questionId,
        ref: getQuestionShareDocRef(schoolId, shareId),
        shareId,
        teacherId,
      };
    }),
  );
  const existingShareSnapshots = await Promise.all(
    shareTargets.map((target) => getDoc(target.ref)),
  );
  const writes = [];
  let reactivatedCount = 0;
  let sharedCount = 0;
  let unchangedCount = 0;

  shareTargets.forEach((target, index) => {
    const existingShareSnapshot = existingShareSnapshots[index];
    const existingShare = existingShareSnapshot.exists()
      ? existingShareSnapshot.data()
      : null;

    if (existingShare?.status === ACTIVE_STATUS) {
      unchangedCount += 1;
      return;
    }

    if (existingShare?.status === REVOKED_STATUS) {
      reactivatedCount += 1;
    } else {
      sharedCount += 1;
    }

    writes.push({
      data: {
        createdAt: existingShare?.createdAt ?? serverTimestamp(),
        ownerId,
        questionId: target.questionId,
        revokedAt: null,
        sharedByTeacherId: ownerId,
        sharedWithTeacherId: target.teacherId,
        status: ACTIVE_STATUS,
        updatedAt: serverTimestamp(),
      },
      ref: target.ref,
    });
  });

  if (writes.length > 0) {
    await commitShareWrites(writes);
  }

  return {
    reactivatedCount,
    sharedCount,
    unchangedCount,
  };
}

export async function revokeQuestionShare({ schoolId, shareId }) {
  if (!shareId) {
    throw createQuestionSharingError(
      "MISSING_SHARE",
      "Choose a shared question before removing access.",
    );
  }

  await updateDoc(getQuestionShareDocRef(schoolId, shareId), {
    revokedAt: serverTimestamp(),
    status: REVOKED_STATUS,
    updatedAt: serverTimestamp(),
  });
}

export async function revokeQuestionShares({ schoolId, shareIds }) {
  const normalizedShareIds = normalizeIdList(shareIds);

  if (normalizedShareIds.length === 0) {
    return {
      revokedCount: 0,
    };
  }

  for (let index = 0; index < normalizedShareIds.length; index += WRITE_BATCH_LIMIT) {
    const batch = writeBatch(db);

    normalizedShareIds.slice(index, index + WRITE_BATCH_LIMIT).forEach((shareId) => {
      batch.update(getQuestionShareDocRef(schoolId, shareId), {
        revokedAt: serverTimestamp(),
        status: REVOKED_STATUS,
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
  }

  return {
    revokedCount: normalizedShareIds.length,
  };
}

export function removeSharedQuestion({ schoolId, shareId }) {
  return revokeQuestionShare({ schoolId, shareId });
}
