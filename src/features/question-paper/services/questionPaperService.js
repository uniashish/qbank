import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../../../services/firebase.js";
import {
  createQuestionPaperDraftDocument,
  createQuestionPaperDraftFields,
  createQuestionPaperFinalFields,
} from "../utils/questionPaperDraft.js";

const SCHOOLS_COLLECTION = "schools";
const QUESTION_PAPERS_COLLECTION = "questionPapers";
const DRAFT_STATUS = "draft";
const FINAL_STATUS = "final";

export const QUESTION_PAPER_ERROR_CODES = {
  FORBIDDEN: "QUESTION_PAPER_FORBIDDEN",
  INVALID_TEACHER_PROFILE: "INVALID_TEACHER_PROFILE",
  MISSING_PAPER: "MISSING_QUESTION_PAPER",
  MISSING_SCHOOL: "MISSING_SCHOOL",
};

function createQuestionPaperError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function assertTeacherProfile(userProfile) {
  if (!userProfile?.uid) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.INVALID_TEACHER_PROFILE,
      "Your teacher profile could not be verified.",
    );
  }

  if (!userProfile.schoolId) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.MISSING_SCHOOL,
      "Your teacher account is not linked to a school.",
    );
  }

  if (!userProfile.name || !userProfile.email) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.INVALID_TEACHER_PROFILE,
      "Your teacher profile is missing creator details.",
    );
  }
}

function getQuestionPapersCollectionRef(schoolId) {
  if (!schoolId) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    QUESTION_PAPERS_COLLECTION,
  );
}

function getQuestionPaperDocRef(schoolId, paperId) {
  if (!paperId) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.MISSING_PAPER,
      "Choose a question paper before saving.",
    );
  }

  return doc(getQuestionPapersCollectionRef(schoolId), paperId);
}

function getSortableTimestamp(value) {
  if (!value) {
    return 0;
  }

  if (typeof value.toMillis === "function") {
    return value.toMillis();
  }

  if (typeof value.toDate === "function") {
    return value.toDate().getTime();
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  return 0;
}

function sortByNewestUpdated(firstPaper, secondPaper) {
  return (
    getSortableTimestamp(secondPaper.updatedAt) -
    getSortableTimestamp(firstPaper.updatedAt)
  );
}

function normalizeQuestionPaperSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function assertPaperAccess(paper, userProfile) {
  if (
    !paper ||
    ![DRAFT_STATUS, FINAL_STATUS].includes(paper.status) ||
    paper.createdBy?.uid !== userProfile.uid
  ) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.FORBIDDEN,
      "You can only open your own papers.",
    );
  }
}

function assertDraftPaperAccess(paper, userProfile) {
  if (
    !paper ||
    paper.status !== DRAFT_STATUS ||
    paper.createdBy?.uid !== userProfile.uid
  ) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.FORBIDDEN,
      "You can only update your own draft papers.",
    );
  }
}

export function createQuestionPaperDraftId(schoolId) {
  return doc(getQuestionPapersCollectionRef(schoolId)).id;
}

export async function createQuestionPaperDraft({
  designerState,
  paperId,
  userProfile,
}) {
  assertTeacherProfile(userProfile);

  const draftDocument = createQuestionPaperDraftDocument({
    designerState,
    userProfile,
  });
  const timestamp = serverTimestamp();

  await setDoc(getQuestionPaperDocRef(userProfile.schoolId, paperId), {
    ...draftDocument,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  return {
    ...draftDocument,
    createdAt: new Date(),
    id: paperId,
    updatedAt: new Date(),
  };
}

export async function updateQuestionPaperDraft({
  designerState,
  paperId,
  userProfile,
}) {
  assertTeacherProfile(userProfile);

  if (designerState?.status !== DRAFT_STATUS) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.FORBIDDEN,
      "Finalized papers cannot be edited.",
    );
  }

  const draftFields = createQuestionPaperDraftFields(designerState);

  await updateDoc(getQuestionPaperDocRef(userProfile.schoolId, paperId), {
    ...draftFields,
    updatedAt: serverTimestamp(),
  });

  return {
    ...draftFields,
    id: paperId,
    updatedAt: new Date(),
  };
}

export async function getQuestionPaper({ paperId, userProfile }) {
  assertTeacherProfile(userProfile);

  const paperSnapshot = await getDoc(
    getQuestionPaperDocRef(userProfile.schoolId, paperId),
  );

  if (!paperSnapshot.exists()) {
    return null;
  }

  const paper = normalizeQuestionPaperSnapshot(paperSnapshot);

  assertPaperAccess(paper, userProfile);

  return paper;
}

export async function getQuestionPaperDraft({ paperId, userProfile }) {
  const paper = await getQuestionPaper({ paperId, userProfile });

  if (!paper) {
    return null;
  }

  assertDraftPaperAccess(paper, userProfile);

  return paper;
}

export async function finalizeQuestionPaperDraft({ paperId, userProfile }) {
  assertTeacherProfile(userProfile);

  const paperRef = getQuestionPaperDocRef(userProfile.schoolId, paperId);
  const paperSnapshot = await getDoc(paperRef);

  if (!paperSnapshot.exists()) {
    throw createQuestionPaperError(
      QUESTION_PAPER_ERROR_CODES.MISSING_PAPER,
      "Choose a question paper before finalizing.",
    );
  }

  const paper = normalizeQuestionPaperSnapshot(paperSnapshot);

  assertDraftPaperAccess(paper, userProfile);

  const finalFields = createQuestionPaperFinalFields({
    documentContent: paper.documentContent,
    setup: paper,
    status: DRAFT_STATUS,
  });
  const timestamp = serverTimestamp();

  await setDoc(paperRef, {
    ...finalFields,
    createdAt: paper.createdAt,
    createdBy: paper.createdBy,
    finalizedAt: timestamp,
    updatedAt: timestamp,
  });

  return {
    ...finalFields,
    createdAt: paper.createdAt,
    createdBy: paper.createdBy,
    finalizedAt: new Date(),
    id: paperId,
    updatedAt: new Date(),
  };
}

export async function getCurrentTeacherQuestionPapers(userProfile) {
  assertTeacherProfile(userProfile);

  const papersQuery = query(
    getQuestionPapersCollectionRef(userProfile.schoolId),
    where("createdBy.uid", "==", userProfile.uid),
  );
  const papersSnapshot = await getDocs(papersQuery);

  return papersSnapshot.docs
    .map(normalizeQuestionPaperSnapshot)
    .filter((paper) => paper.createdBy?.uid === userProfile.uid)
    .sort(sortByNewestUpdated);
}

export async function getCurrentTeacherQuestionPaperDrafts(userProfile) {
  const papers = await getCurrentTeacherQuestionPapers(userProfile);

  return papers.filter((paper) => paper.status === DRAFT_STATUS);
}
