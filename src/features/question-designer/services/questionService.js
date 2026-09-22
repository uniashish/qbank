import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { normalizeQuestionForSave } from "../persistence/questionPersistenceNormalizer.js";
import { db } from "../../../services/firebase.js";

const SCHOOLS_COLLECTION = "schools";
const QUESTIONS_COLLECTION = "questions";
const ACTIVE_STATUS = "active";

export function createQuestionReference(schoolId) {
  return doc(collection(db, SCHOOLS_COLLECTION, schoolId, QUESTIONS_COLLECTION));
}

export function createQuestionDocument({ draft, image, teacherProfile }) {
  return {
    ...normalizeQuestionForSave({
      ...draft,
      image,
      status: ACTIVE_STATUS,
    }),
    createdAt: serverTimestamp(),
    createdBy: {
      email: teacherProfile.email,
      name: teacherProfile.name,
      uid: teacherProfile.uid,
    },
    updatedAt: serverTimestamp(),
  };
}

export async function createQuestion({ questionData, questionRef }) {
  console.log(
    "[Question Save Payload]",
    JSON.stringify(
      {
        questionType: questionData.questionType,
        prompt: questionData.prompt,
        answerData: questionData.answerData,
        image: questionData.image,
        tags: questionData.tags,
      },
      null,
      2,
    ),
  );

  await setDoc(questionRef, questionData);

  return {
    id: questionRef.id,
    ...questionData,
  };
}
