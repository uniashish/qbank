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
const CLASSES_COLLECTION = "classes";

export const CLASS_SERVICE_ERROR_CODES = {
  DUPLICATE_CODE: "DUPLICATE_CLASS_CODE",
  INVALID_PAYLOAD: "INVALID_CLASS_PAYLOAD",
  MISSING_SCHOOL: "MISSING_SCHOOL",
};

function createClassServiceError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function getClassesCollectionRef(schoolId) {
  if (!schoolId) {
    throw createClassServiceError(
      CLASS_SERVICE_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(db, SCHOOLS_COLLECTION, schoolId, CLASSES_COLLECTION);
}

function getClassDocRef(schoolId, classId) {
  return doc(db, SCHOOLS_COLLECTION, schoolId, CLASSES_COLLECTION, classId);
}

function normalizeName(name) {
  return name.trim().replace(/\s+/g, " ");
}

export function normalizeClassCode(code) {
  return code.trim().replace(/\s+/g, "-").toUpperCase();
}

function normalizeStatus(status) {
  return status === ACADEMIC_STATUSES.INACTIVE
    ? ACADEMIC_STATUSES.INACTIVE
    : ACADEMIC_STATUSES.ACTIVE;
}

function normalizeClassPayload({ code, name, status }) {
  const normalizedName = normalizeName(name ?? "");
  const normalizedCode = normalizeClassCode(code ?? "");

  if (!normalizedName || !normalizedCode) {
    throw createClassServiceError(
      CLASS_SERVICE_ERROR_CODES.INVALID_PAYLOAD,
      "Class name and code are required.",
    );
  }

  return {
    code: normalizedCode,
    name: normalizedName,
    status: normalizeStatus(status),
  };
}

function normalizeClassSnapshot(snapshot) {
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

async function assertUniqueClassCode(schoolId, code, ignoredClassId = "") {
  const classes = await getClassesForSchool(schoolId);
  const duplicateClass = classes.find(
    (classRecord) =>
      classRecord.id !== ignoredClassId && classRecord.code === code,
  );

  if (duplicateClass) {
    throw createClassServiceError(
      CLASS_SERVICE_ERROR_CODES.DUPLICATE_CODE,
      "A class with this code already exists.",
    );
  }
}

export async function getClassesForSchool(schoolId) {
  const classesSnapshot = await getDocs(getClassesCollectionRef(schoolId));

  return classesSnapshot.docs.map(normalizeClassSnapshot).sort(sortByNameThenCode);
}

export async function createClass({
  code,
  createdByUid,
  name,
  schoolId,
  status = ACADEMIC_STATUSES.ACTIVE,
}) {
  const payload = normalizeClassPayload({ code, name, status });

  await assertUniqueClassCode(schoolId, payload.code);

  const classRef = await addDoc(getClassesCollectionRef(schoolId), {
    ...payload,
    createdAt: serverTimestamp(),
    createdBy: createdByUid,
    updatedAt: serverTimestamp(),
  });

  return {
    id: classRef.id,
    ...payload,
    createdAt: new Date(),
    createdBy: createdByUid,
    updatedAt: new Date(),
  };
}

export async function updateClass({
  classId,
  code,
  name,
  schoolId,
  status = ACADEMIC_STATUSES.ACTIVE,
}) {
  const payload = normalizeClassPayload({ code, name, status });

  await assertUniqueClassCode(schoolId, payload.code, classId);
  await updateDoc(getClassDocRef(schoolId, classId), {
    ...payload,
    updatedAt: serverTimestamp(),
  });

  return {
    id: classId,
    ...payload,
    updatedAt: new Date(),
  };
}

export function updateClassStatus(schoolId, classId, status) {
  return updateDoc(getClassDocRef(schoolId, classId), {
    status: normalizeStatus(status),
    updatedAt: serverTimestamp(),
  });
}
