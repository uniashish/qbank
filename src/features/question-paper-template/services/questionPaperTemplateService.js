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
  createQuestionPaperTemplateDocument,
  createQuestionPaperTemplateFields,
  normalizeQuestionPaperTemplate,
} from "../utils/questionPaperTemplate.js";

const SCHOOLS_COLLECTION = "schools";
const QUESTION_PAPER_TEMPLATES_COLLECTION = "questionPaperTemplates";
const ACTIVE_STATUS = "active";
const ARCHIVED_STATUS = "archived";

export const QUESTION_PAPER_TEMPLATE_ERROR_CODES = {
  FORBIDDEN: "QUESTION_PAPER_TEMPLATE_FORBIDDEN",
  INVALID_TEACHER_PROFILE: "INVALID_TEACHER_PROFILE",
  MISSING_SCHOOL: "MISSING_SCHOOL",
  MISSING_TEMPLATE: "MISSING_QUESTION_PAPER_TEMPLATE",
};

function createQuestionPaperTemplateError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function assertTeacherProfile(userProfile) {
  if (!userProfile?.uid) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.INVALID_TEACHER_PROFILE,
      "Your teacher profile could not be verified.",
    );
  }

  if (!userProfile.schoolId) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.MISSING_SCHOOL,
      "Your teacher account is not linked to a school.",
    );
  }

  if (!userProfile.name || !userProfile.email) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.INVALID_TEACHER_PROFILE,
      "Your teacher profile is missing creator details.",
    );
  }
}

function getQuestionPaperTemplatesCollectionRef(schoolId) {
  if (!schoolId) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    QUESTION_PAPER_TEMPLATES_COLLECTION,
  );
}

function getQuestionPaperTemplateDocRef(schoolId, templateId) {
  if (!templateId) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.MISSING_TEMPLATE,
      "Choose a question paper template before continuing.",
    );
  }

  return doc(getQuestionPaperTemplatesCollectionRef(schoolId), templateId);
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

function sortByNewestUpdated(firstTemplate, secondTemplate) {
  return (
    getSortableTimestamp(secondTemplate.updatedAt) -
    getSortableTimestamp(firstTemplate.updatedAt)
  );
}

function normalizeQuestionPaperTemplateSnapshot(snapshot) {
  return normalizeQuestionPaperTemplate({
    id: snapshot.id,
    ...snapshot.data(),
  });
}

function assertTemplateAccess(template, userProfile) {
  if (
    !template ||
    ![ACTIVE_STATUS, ARCHIVED_STATUS].includes(template.status) ||
    template.createdBy?.uid !== userProfile.uid
  ) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.FORBIDDEN,
      "You can only open your own question paper templates.",
    );
  }
}

export function createQuestionPaperTemplateId(schoolId) {
  return doc(getQuestionPaperTemplatesCollectionRef(schoolId)).id;
}

export async function createQuestionPaperTemplate({
  template = {},
  templateId,
  userProfile,
}) {
  assertTeacherProfile(userProfile);

  const resolvedTemplateId =
    templateId || createQuestionPaperTemplateId(userProfile.schoolId);
  const templateDocument = createQuestionPaperTemplateDocument({
    template,
    userProfile,
  });
  const timestamp = serverTimestamp();

  await setDoc(
    getQuestionPaperTemplateDocRef(userProfile.schoolId, resolvedTemplateId),
    {
      ...templateDocument,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  );

  return normalizeQuestionPaperTemplate({
    ...templateDocument,
    createdAt: new Date(),
    id: resolvedTemplateId,
    updatedAt: new Date(),
  });
}

export async function getQuestionPaperTemplate({ templateId, userProfile }) {
  assertTeacherProfile(userProfile);

  const templateSnapshot = await getDoc(
    getQuestionPaperTemplateDocRef(userProfile.schoolId, templateId),
  );

  if (!templateSnapshot.exists()) {
    return null;
  }

  const template = normalizeQuestionPaperTemplateSnapshot(templateSnapshot);

  assertTemplateAccess(template, userProfile);

  return template;
}

export async function getCurrentTeacherQuestionPaperTemplates(userProfile) {
  assertTeacherProfile(userProfile);

  const templatesQuery = query(
    getQuestionPaperTemplatesCollectionRef(userProfile.schoolId),
    where("createdBy.uid", "==", userProfile.uid),
    where("status", "==", ACTIVE_STATUS),
  );
  const templatesSnapshot = await getDocs(templatesQuery);

  return templatesSnapshot.docs
    .map(normalizeQuestionPaperTemplateSnapshot)
    .filter(
      (template) =>
        template.createdBy?.uid === userProfile.uid &&
        template.status === ACTIVE_STATUS,
    )
    .sort(sortByNewestUpdated);
}

export async function updateQuestionPaperTemplate({
  template,
  templateId,
  userProfile,
}) {
  assertTeacherProfile(userProfile);

  const existingTemplate = await getQuestionPaperTemplate({
    templateId,
    userProfile,
  });

  if (!existingTemplate) {
    throw createQuestionPaperTemplateError(
      QUESTION_PAPER_TEMPLATE_ERROR_CODES.MISSING_TEMPLATE,
      "This question paper template could not be found.",
    );
  }

  const templateFields = createQuestionPaperTemplateFields({
    ...existingTemplate,
    ...template,
    defaultSetup: {
      ...existingTemplate.defaultSetup,
      ...(template?.defaultSetup ?? {}),
    },
    settings: {
      ...existingTemplate.settings,
      ...(template?.settings ?? {}),
    },
    status: ACTIVE_STATUS,
  });

  await updateDoc(
    getQuestionPaperTemplateDocRef(userProfile.schoolId, templateId),
    {
      ...templateFields,
      updatedAt: serverTimestamp(),
    },
  );

  return normalizeQuestionPaperTemplate({
    ...existingTemplate,
    ...templateFields,
    id: templateId,
    updatedAt: new Date(),
  });
}

export async function archiveQuestionPaperTemplate({
  templateId,
  userProfile,
}) {
  assertTeacherProfile(userProfile);

  await updateDoc(
    getQuestionPaperTemplateDocRef(userProfile.schoolId, templateId),
    {
      status: ARCHIVED_STATUS,
      updatedAt: serverTimestamp(),
    },
  );

  return {
    id: templateId,
    status: ARCHIVED_STATUS,
    updatedAt: new Date(),
  };
}
