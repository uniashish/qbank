import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { getActiveQuestionSharesForRecipient } from "../features/question-sharing/questionSharingService.js";
import { QUESTION_TYPES } from "../features/question-designer/constants/questionTypes.js";
import { createPersistableMatchPairs } from "../features/question-designer/utils/matchPairHelpers.js";
import { cloneRichTextContent } from "../features/question-designer/utils/richTextContent.js";
import {
  deleteQuestionImage,
  uploadQuestionImage,
} from "../features/question-designer/services/questionImageService.js";
import { assertQuestionCanBeSaved } from "../features/question-designer/validation/questionPersistenceValidation.js";
import { sanitizeTags } from "../components/tags/tagUtils.js";
import { db } from "./firebase.js";

const SCHOOLS_COLLECTION = "schools";
const QUESTIONS_COLLECTION = "questions";
const ACTIVE_STATUS = "active";
const DELETED_STATUS = "deleted";

const OWNER_ACCESS = {
  canDelete: true,
  canEdit: true,
  canRemove: false,
  type: "owner",
};

const SHARED_ACCESS = {
  canDelete: false,
  canEdit: false,
  canRemove: true,
  type: "shared",
};

export const QUESTION_BANK_ERROR_CODES = {
  INVALID_QUESTION: "INVALID_QUESTION",
  MISSING_QUESTION: "MISSING_QUESTION",
  MISSING_SCHOOL: "MISSING_SCHOOL",
  MISSING_TEACHER: "MISSING_TEACHER",
  UNSUPPORTED_QUESTION_TYPE: "UNSUPPORTED_QUESTION_TYPE",
};

function createQuestionBankError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function trimText(value) {
  return String(value ?? "").trim();
}

function getQuestionsCollectionRef(schoolId) {
  if (!schoolId) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(db, SCHOOLS_COLLECTION, schoolId, QUESTIONS_COLLECTION);
}

function getQuestionDocRef(schoolId, questionId) {
  if (!questionId) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_QUESTION,
      "Choose a question before continuing.",
    );
  }

  return doc(getQuestionsCollectionRef(schoolId), questionId);
}

function normalizeQuestionSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
    tags: sanitizeTags(snapshot.data().tags),
  };
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

function sortByNewestCreated(firstQuestion, secondQuestion) {
  return (
    getSortableTimestamp(secondQuestion.createdAt) -
    getSortableTimestamp(firstQuestion.createdAt)
  );
}

function withOwnerAccess(question) {
  return {
    ...question,
    access: OWNER_ACCESS,
    shareInfo: null,
  };
}

function withSharedAccess(question, share) {
  return {
    ...question,
    access: SHARED_ACCESS,
    shareInfo: {
      ownerId: share.ownerId,
      ownerName: question.createdBy?.name ?? "Question owner",
      shareId: share.id,
    },
  };
}

function createPersistedAnswerData(draft) {
  switch (draft.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return {
        blanks: draft.answerData.blanks.map((blank) => ({
          id: blank.id,
          acceptedAnswers: blank.acceptedAnswers.map((answer) =>
            trimText(answer),
          ),
        })),
      };

    case QUESTION_TYPES.LONG_ANSWER:
      return {
        modelAnswer: cloneRichTextContent(draft.answerData.modelAnswer),
        questionContent: cloneRichTextContent(draft.answerData.questionContent),
        suggestedWordCount: draft.answerData.suggestedWordCount ?? null,
      };

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        correctOptionId: draft.answerData.correctOptionId,
        options: draft.answerData.options.map((option) => ({
          id: option.id,
          text: trimText(option.text),
        })),
      };

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return {
        pairs: createPersistableMatchPairs(draft.answerData.pairs),
      };

    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        modelAnswer: cloneRichTextContent(draft.answerData.modelAnswer),
        questionContent: cloneRichTextContent(draft.answerData.questionContent),
      };

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        correctAnswer: draft.answerData.correctAnswer,
      };

    default:
      throw createQuestionBankError(
        QUESTION_BANK_ERROR_CODES.UNSUPPORTED_QUESTION_TYPE,
        "This question type cannot be edited right now.",
      );
  }
}

async function resolveQuestionImage({ draft, existingQuestion, questionId, schoolId }) {
  const draftImage = draft.questionImage ?? {};

  if (draftImage.file) {
    return uploadQuestionImage({
      file: draftImage.file,
      questionId,
      schoolId,
    });
  }

  if (draftImage.downloadUrl || draftImage.storagePath) {
    return {
      downloadUrl:
        draftImage.downloadUrl ?? existingQuestion?.image?.downloadUrl ?? null,
      storagePath:
        draftImage.storagePath ?? existingQuestion?.image?.storagePath ?? null,
    };
  }

  return {
    downloadUrl: null,
    storagePath: null,
  };
}

function createQuestionUpdatePayload({ draft, image }) {
  return {
    answerData: createPersistedAnswerData(draft),
    classId: draft.classId,
    difficulty: draft.difficulty,
    image: {
      downloadUrl: image.downloadUrl,
      storagePath: image.storagePath,
    },
    instructions: trimText(draft.instructions),
    marks: Number(draft.marks),
    prompt: trimText(draft.prompt),
    questionType: draft.questionType,
    status: ACTIVE_STATUS,
    subjectId: draft.subjectId,
    tags: sanitizeTags(draft.tags),
    topicName: trimText(draft.topicName),
    updatedAt: serverTimestamp(),
  };
}

export async function getOwnedTeacherQuestions(schoolId, teacherId) {
  if (!teacherId) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_TEACHER,
      "Your teacher profile could not be verified.",
    );
  }

  const questionsQuery = query(
    getQuestionsCollectionRef(schoolId),
    where("createdBy.uid", "==", teacherId),
    where("status", "==", ACTIVE_STATUS),
  );
  const questionsSnapshot = await getDocs(questionsQuery);

  return questionsSnapshot.docs
    .map(normalizeQuestionSnapshot)
    .map(withOwnerAccess)
    .sort(sortByNewestCreated);
}

export async function getSharedTeacherQuestions(schoolId, teacherId) {
  if (!teacherId) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_TEACHER,
      "Your teacher profile could not be verified.",
    );
  }

  const shares = await getActiveQuestionSharesForRecipient({
    schoolId,
    teacherId,
  });
  const questionSnapshots = await Promise.all(
    shares.map((share) => getDoc(getQuestionDocRef(schoolId, share.questionId))),
  );

  return questionSnapshots
    .map((questionSnapshot, index) => {
      if (!questionSnapshot.exists()) {
        return null;
      }

      const question = normalizeQuestionSnapshot(questionSnapshot);

      if (question.status !== ACTIVE_STATUS) {
        return null;
      }

      return withSharedAccess(question, shares[index]);
    })
    .filter(Boolean)
    .sort(sortByNewestCreated);
}

export async function getTeacherQuestions(
  schoolId,
  teacherId,
  { ownedOnly = false } = {},
) {
  const ownedQuestions = await getOwnedTeacherQuestions(schoolId, teacherId);

  if (ownedOnly) {
    return ownedQuestions;
  }

  const sharedQuestions = await getSharedTeacherQuestions(schoolId, teacherId);

  return [...ownedQuestions, ...sharedQuestions].sort(sortByNewestCreated);
}

export async function getQuestionById(schoolId, questionId) {
  const questionSnapshot = await getDoc(getQuestionDocRef(schoolId, questionId));

  if (!questionSnapshot.exists()) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_QUESTION,
      "This question could not be found.",
    );
  }

  return normalizeQuestionSnapshot(questionSnapshot);
}

export async function updateQuestion({
  draft,
  existingQuestion,
  questionId,
  schoolId,
  teacherProfile,
}) {
  assertQuestionCanBeSaved({ draft, teacherProfile });

  const targetQuestionId = questionId || existingQuestion?.id;

  if (!targetQuestionId) {
    throw createQuestionBankError(
      QUESTION_BANK_ERROR_CODES.MISSING_QUESTION,
      "Choose a question before saving changes.",
    );
  }

  let uploadedImage = {
    downloadUrl: null,
    storagePath: null,
  };

  try {
    uploadedImage = await resolveQuestionImage({
      draft,
      existingQuestion,
      questionId: targetQuestionId,
      schoolId,
    });

    const updatePayload = createQuestionUpdatePayload({
      draft,
      image: uploadedImage,
    });

    await updateDoc(getQuestionDocRef(schoolId, targetQuestionId), updatePayload);

    return {
      ...existingQuestion,
      ...updatePayload,
      id: targetQuestionId,
      image: {
        downloadUrl: uploadedImage.downloadUrl,
        storagePath: uploadedImage.storagePath,
      },
    };
  } catch (error) {
    if (draft.questionImage?.file && uploadedImage.storagePath) {
      try {
        await deleteQuestionImage(uploadedImage.storagePath);
      } catch (cleanupError) {
        console.error("[Question bank] Failed to clean up uploaded image.", {
          cleanupError,
          storagePath: uploadedImage.storagePath,
        });
      }
    }

    throw error;
  }
}

export async function softDeleteQuestion(schoolId, questionId) {
  await updateDoc(getQuestionDocRef(schoolId, questionId), {
    status: DELETED_STATUS,
    updatedAt: serverTimestamp(),
  });

  return {
    id: questionId,
    status: DELETED_STATUS,
  };
}
