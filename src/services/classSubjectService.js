import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "./firebase";

const SCHOOLS_COLLECTION = "schools";
const CLASS_SUBJECTS_COLLECTION = "classSubjects";
const MAPPING_ID_SEPARATOR = "__";

export const CLASS_SUBJECT_SERVICE_ERROR_CODES = {
  INVALID_MAPPING: "INVALID_CLASS_SUBJECT_MAPPING",
  MISSING_SCHOOL: "MISSING_SCHOOL",
};

function createClassSubjectServiceError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function getClassSubjectsCollectionRef(schoolId) {
  if (!schoolId) {
    throw createClassSubjectServiceError(
      CLASS_SUBJECT_SERVICE_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(db, SCHOOLS_COLLECTION, schoolId, CLASS_SUBJECTS_COLLECTION);
}

function getMappingDocRef(schoolId, classId, subjectId) {
  return doc(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    CLASS_SUBJECTS_COLLECTION,
    getClassSubjectMappingId(classId, subjectId),
  );
}

function normalizeMappingSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function normalizeIdList(ids) {
  return [...new Set(ids.filter(Boolean))];
}

export function getClassSubjectMappingId(classId, subjectId) {
  return `${classId}${MAPPING_ID_SEPARATOR}${subjectId}`;
}

export async function getClassSubjectMappingsForSchool(schoolId) {
  const mappingsSnapshot = await getDocs(getClassSubjectsCollectionRef(schoolId));

  return mappingsSnapshot.docs.map(normalizeMappingSnapshot);
}

export async function getClassSubjectMappingsForClass(schoolId, classId) {
  if (!classId) {
    return [];
  }

  const mappingsQuery = query(
    getClassSubjectsCollectionRef(schoolId),
    where("classId", "==", classId),
  );
  const mappingsSnapshot = await getDocs(mappingsQuery);

  return mappingsSnapshot.docs.map(normalizeMappingSnapshot);
}

export async function createClassSubjectMapping({
  classId,
  createdByUid,
  schoolId,
  subjectId,
}) {
  if (!classId || !subjectId) {
    throw createClassSubjectServiceError(
      CLASS_SUBJECT_SERVICE_ERROR_CODES.INVALID_MAPPING,
      "Choose a class and subject before saving.",
    );
  }

  await setDoc(getMappingDocRef(schoolId, classId, subjectId), {
    classId,
    createdAt: serverTimestamp(),
    createdBy: createdByUid,
    subjectId,
  });
}

export function deleteClassSubjectMapping(schoolId, classId, subjectId) {
  return deleteDoc(getMappingDocRef(schoolId, classId, subjectId));
}

export async function saveSubjectMappingsForClass({
  classId,
  createdByUid,
  schoolId,
  subjectIds,
}) {
  if (!classId) {
    throw createClassSubjectServiceError(
      CLASS_SUBJECT_SERVICE_ERROR_CODES.INVALID_MAPPING,
      "Choose a class before saving subjects.",
    );
  }

  const nextSubjectIds = normalizeIdList(subjectIds);
  const existingMappings = await getClassSubjectMappingsForClass(schoolId, classId);
  const existingBySubjectId = new Map(
    existingMappings.map((mapping) => [mapping.subjectId, mapping]),
  );
  const nextSubjectIdSet = new Set(nextSubjectIds);
  const batch = writeBatch(db);
  let operationCount = 0;

  nextSubjectIds.forEach((subjectId) => {
    if (existingBySubjectId.has(subjectId)) {
      return;
    }

    batch.set(getMappingDocRef(schoolId, classId, subjectId), {
      classId,
      createdAt: serverTimestamp(),
      createdBy: createdByUid,
      subjectId,
    });
    operationCount += 1;
  });

  existingMappings.forEach((mapping) => {
    if (nextSubjectIdSet.has(mapping.subjectId)) {
      return;
    }

    batch.delete(doc(getClassSubjectsCollectionRef(schoolId), mapping.id));
    operationCount += 1;
  });

  if (operationCount === 0) {
    return existingMappings;
  }

  await batch.commit();

  return getClassSubjectMappingsForClass(schoolId, classId);
}
