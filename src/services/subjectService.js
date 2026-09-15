import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { ACADEMIC_STATUSES } from "../constants/academicStatus.js";
import { db } from "./firebase";

const SCHOOLS_COLLECTION = "schools";
const SUBJECTS_COLLECTION = "subjects";

export const SUBJECT_SERVICE_ERROR_CODES = {
  DUPLICATE_CODE: "DUPLICATE_SUBJECT_CODE",
  INVALID_PAYLOAD: "INVALID_SUBJECT_PAYLOAD",
  MISSING_SCHOOL: "MISSING_SCHOOL",
};

function createSubjectServiceError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function getSubjectsCollectionRef(schoolId) {
  if (!schoolId) {
    throw createSubjectServiceError(
      SUBJECT_SERVICE_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(db, SCHOOLS_COLLECTION, schoolId, SUBJECTS_COLLECTION);
}

function getSubjectDocRef(schoolId, subjectId) {
  return doc(db, SCHOOLS_COLLECTION, schoolId, SUBJECTS_COLLECTION, subjectId);
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeSubjectCode(code) {
  return code.trim().replace(/\s+/g, "-").toUpperCase();
}

function normalizeStatus(status) {
  return status === ACADEMIC_STATUSES.INACTIVE
    ? ACADEMIC_STATUSES.INACTIVE
    : ACADEMIC_STATUSES.ACTIVE;
}

function normalizeSubjectPayload({ code, name, status }) {
  const normalizedName = normalizeName(name ?? "");
  const normalizedCode = normalizeSubjectCode(code ?? "");

  if (!normalizedName || !normalizedCode) {
    throw createSubjectServiceError(
      SUBJECT_SERVICE_ERROR_CODES.INVALID_PAYLOAD,
      "Subject name and code are required.",
    );
  }

  return {
    code: normalizedCode,
    name: normalizedName,
    status: normalizeStatus(status),
  };
}

function normalizeSubjectSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function sortByNameThenCode(firstItem, secondItem) {
  return (
    firstItem.name.localeCompare(secondItem.name) ||
    firstItem.code.localeCompare(secondItem.code)
  );
}

async function assertUniqueSubjectCode(schoolId, code, ignoredSubjectId = "") {
  const subjects = await getSubjectsForSchool(schoolId);
  const duplicateSubject = subjects.find(
    (subject) => subject.id !== ignoredSubjectId && subject.code === code,
  );

  if (duplicateSubject) {
    throw createSubjectServiceError(
      SUBJECT_SERVICE_ERROR_CODES.DUPLICATE_CODE,
      "A subject with this code already exists.",
    );
  }
}

export async function getSubjectsForSchool(schoolId) {
  const subjectsSnapshot = await getDocs(getSubjectsCollectionRef(schoolId));

  return subjectsSnapshot.docs.map(normalizeSubjectSnapshot).sort(sortByNameThenCode);
}

export async function createSubject({
  code,
  createdByUid,
  name,
  schoolId,
  status = ACADEMIC_STATUSES.ACTIVE,
}) {
  const payload = normalizeSubjectPayload({ code, name, status });

  await assertUniqueSubjectCode(schoolId, payload.code);

  const subjectRef = await addDoc(getSubjectsCollectionRef(schoolId), {
    ...payload,
    createdAt: serverTimestamp(),
    createdBy: createdByUid,
    updatedAt: serverTimestamp(),
  });

  return {
    id: subjectRef.id,
    ...payload,
    createdAt: new Date(),
    createdBy: createdByUid,
    updatedAt: new Date(),
  };
}

export async function updateSubject({
  code,
  name,
  schoolId,
  status = ACADEMIC_STATUSES.ACTIVE,
  subjectId,
}) {
  const payload = normalizeSubjectPayload({ code, name, status });

  await assertUniqueSubjectCode(schoolId, payload.code, subjectId);
  await updateDoc(getSubjectDocRef(schoolId, subjectId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return {
    id: subjectId,
    ...payload,
    updatedAt: new Date(),
  };
}

export function updateSubjectStatus(schoolId, subjectId, status) {
  return updateDoc(getSubjectDocRef(schoolId, subjectId), {
    status: normalizeStatus(status),
    updatedAt: serverTimestamp(),
  });
}
