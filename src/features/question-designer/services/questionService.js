import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { QUESTION_TYPES } from "../constants/questionTypes.js";
import { createPersistableMatchPairs } from "../utils/matchPairHelpers.js";
import { cloneRichTextContent } from "../utils/richTextContent.js";
import { db } from "../../../services/firebase.js";

const SCHOOLS_COLLECTION = "schools";
const QUESTIONS_COLLECTION = "questions";
const ACTIVE_STATUS = "active";

function trimText(value) {
  return String(value ?? "").trim();
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
      return null;
  }
}

export function createQuestionReference(schoolId) {
  return doc(collection(db, SCHOOLS_COLLECTION, schoolId, QUESTIONS_COLLECTION));
}

export function createQuestionDocument({ draft, image, teacherProfile }) {
  return {
    answerData: createPersistedAnswerData(draft),
    classId: draft.classId,
    createdAt: serverTimestamp(),
    createdBy: {
      email: teacherProfile.email,
      name: teacherProfile.name,
      uid: teacherProfile.uid,
    },
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
    topicName: trimText(draft.topicName),
    updatedAt: serverTimestamp(),
  };
}

export async function createQuestion({ questionData, questionRef }) {
  await setDoc(questionRef, questionData);

  return {
    id: questionRef.id,
    ...questionData,
  };
}
