import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { ACADEMIC_STATUSES } from "../constants/academicStatus.js";
import { USER_ROLES } from "../constants/roles.js";
import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import {
  getClassSubjectMappingId,
  getClassSubjectMappingsForSchool,
} from "./classSubjectService.js";
import { getClassesForSchool } from "./classService.js";
import { db } from "./firebase";
import { getSubjectsForSchool } from "./subjectService.js";
import { getUserProfile } from "./userService.js";

const SCHOOLS_COLLECTION = "schools";
const TEACHER_ASSIGNMENTS_COLLECTION = "teacherAssignments";
const ASSIGNMENT_ID_SEPARATOR = "__";

export const TEACHER_ASSIGNMENT_ERROR_CODES = {
  INVALID_ASSIGNMENT: "INVALID_TEACHER_ASSIGNMENT",
  INVALID_TEACHER: "INVALID_TEACHER",
  MISSING_SCHOOL: "MISSING_SCHOOL",
};

function createTeacherAssignmentError(code, message) {
  const error = new Error(message);
  error.code = code;

  return error;
}

function getTeacherAssignmentsCollectionRef(schoolId) {
  if (!schoolId) {
    throw createTeacherAssignmentError(
      TEACHER_ASSIGNMENT_ERROR_CODES.MISSING_SCHOOL,
      "No school is linked to this account.",
    );
  }

  return collection(
    db,
    SCHOOLS_COLLECTION,
    schoolId,
    TEACHER_ASSIGNMENTS_COLLECTION,
  );
}

function getTeacherAssignmentDocRef(schoolId, teacherId, classId, subjectId) {
  return doc(
    getTeacherAssignmentsCollectionRef(schoolId),
    getTeacherAssignmentId(teacherId, classId, subjectId),
  );
}

function normalizeAssignmentSnapshot(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

function normalizeSelections(selections) {
  const uniquePairIds = new Set();
  const normalizedSelections = [];

  function addSelection(classId, subjectId) {
    if (!classId || !subjectId) {
      return;
    }

    const pairId = getClassSubjectMappingId(classId, subjectId);

    if (uniquePairIds.has(pairId)) {
      return;
    }

    uniquePairIds.add(pairId);
    normalizedSelections.push({ classId, subjectId });
  }

  if (!selections) {
    return [];
  }

  if (Array.isArray(selections)) {
    selections.forEach((selection) => {
      addSelection(selection?.classId, selection?.subjectId);
    });

    return normalizedSelections;
  }

  Object.entries(selections).forEach(([classId, subjectIds]) => {
    [...new Set(subjectIds ?? [])].forEach((subjectId) => {
      addSelection(classId, subjectId);
    });
  });

  return normalizedSelections;
}

function sortByClassThenSubject(firstItem, secondItem) {
  return (
    firstItem.classRecord.name.localeCompare(secondItem.classRecord.name) ||
    firstItem.subject.name.localeCompare(secondItem.subject.name) ||
    firstItem.subject.code.localeCompare(secondItem.subject.code)
  );
}

function groupAssignmentPairs(assignmentPairs) {
  const groupedByClass = new Map();

  assignmentPairs.forEach((assignmentPair) => {
    const { classRecord, subject } = assignmentPair;
    if (!groupedByClass.has(classRecord.id)) {
      groupedByClass.set(classRecord.id, {
        classRecord,
        subjects: [],
      });
    }

    groupedByClass.get(classRecord.id).subjects.push(subject);
  });

  return [...groupedByClass.values()]
    .map((group) => ({
      ...group,
      subjects: group.subjects.sort((firstSubject, secondSubject) =>
        firstSubject.name.localeCompare(secondSubject.name),
      ),
    }))
    .sort((firstGroup, secondGroup) =>
      firstGroup.classRecord.name.localeCompare(secondGroup.classRecord.name),
    );
}

export function getTeacherAssignmentId(teacherId, classId, subjectId) {
  return [teacherId, classId, subjectId].join(ASSIGNMENT_ID_SEPARATOR);
}

export async function getTeacherAssignments(schoolId, teacherId) {
  if (!teacherId) {
    return [];
  }

  const assignmentsQuery = query(
    getTeacherAssignmentsCollectionRef(schoolId),
    where("teacherId", "==", teacherId),
    where("status", "==", "active"),
  );
  const assignmentsSnapshot = await getDocs(assignmentsQuery);

  return assignmentsSnapshot.docs.map(normalizeAssignmentSnapshot);
}

export async function getAssignableClassSubjects(schoolId) {
  const [classes, subjects, mappings] = await Promise.all([
    getClassesForSchool(schoolId),
    getSubjectsForSchool(schoolId),
    getClassSubjectMappingsForSchool(schoolId),
  ]);
  const activeClasses = classes.filter(
    (classRecord) => classRecord.status === ACADEMIC_STATUSES.ACTIVE,
  );
  const activeSubjects = subjects.filter(
    (subject) => subject.status === ACADEMIC_STATUSES.ACTIVE,
  );
  const activeClassById = new Map(
    activeClasses.map((classRecord) => [classRecord.id, classRecord]),
  );
  const activeSubjectById = new Map(
    activeSubjects.map((subject) => [subject.id, subject]),
  );
  const uniquePairIds = new Set();
  const pairs = [];

  mappings.forEach((mapping) => {
    const classRecord = activeClassById.get(mapping.classId);
    const subject = activeSubjectById.get(mapping.subjectId);

    if (!classRecord || !subject) {
      return;
    }

    const pairId = getClassSubjectMappingId(classRecord.id, subject.id);

    if (uniquePairIds.has(pairId)) {
      return;
    }

    uniquePairIds.add(pairId);
    pairs.push({
      classId: classRecord.id,
      classRecord,
      id: pairId,
      subject,
      subjectId: subject.id,
    });
  });

  return pairs.sort(sortByClassThenSubject);
}

export async function saveTeacherAssignments(
  schoolId,
  teacherId,
  selections,
  adminUid,
) {
  const teacherProfile = await getUserProfile(teacherId);

  if (
    !teacherProfile ||
    teacherProfile.schoolId !== schoolId ||
    teacherProfile.role !== USER_ROLES.TEACHER ||
    teacherProfile.status !== ACCOUNT_STATUSES.ACTIVE
  ) {
    throw createTeacherAssignmentError(
      TEACHER_ASSIGNMENT_ERROR_CODES.INVALID_TEACHER,
      "Choose a teacher from your school before saving assignments.",
    );
  }

  const assignablePairs = await getAssignableClassSubjects(schoolId);
  const assignablePairIds = new Set(assignablePairs.map((pair) => pair.id));
  const nextAssignments = normalizeSelections(selections);
  const nextAssignmentIds = new Set();

  nextAssignments.forEach((assignment) => {
    const pairId = getClassSubjectMappingId(assignment.classId, assignment.subjectId);

    if (!assignablePairIds.has(pairId)) {
      throw createTeacherAssignmentError(
        TEACHER_ASSIGNMENT_ERROR_CODES.INVALID_ASSIGNMENT,
        "Assignments can only use active class-subject mappings.",
      );
    }

    nextAssignmentIds.add(
      getTeacherAssignmentId(
        teacherId,
        assignment.classId,
        assignment.subjectId,
      ),
    );
  });

  const existingAssignments = await getTeacherAssignments(schoolId, teacherId);
  const existingAssignmentIds = new Set(
    existingAssignments.map((assignment) => assignment.id),
  );
  const batch = writeBatch(db);
  let operationCount = 0;

  nextAssignments.forEach((assignment) => {
    const assignmentId = getTeacherAssignmentId(
      teacherId,
      assignment.classId,
      assignment.subjectId,
    );

    if (existingAssignmentIds.has(assignmentId)) {
      return;
    }

    batch.set(
      getTeacherAssignmentDocRef(
        schoolId,
        teacherId,
        assignment.classId,
        assignment.subjectId,
      ),
      {
        classId: assignment.classId,
        createdAt: serverTimestamp(),
        createdBy: adminUid,
        status: "active",
        subjectId: assignment.subjectId,
        teacherId,
        updatedAt: serverTimestamp(),
      },
    );
    operationCount += 1;
  });

  existingAssignments.forEach((assignment) => {
    if (nextAssignmentIds.has(assignment.id)) {
      return;
    }

    batch.delete(doc(getTeacherAssignmentsCollectionRef(schoolId), assignment.id));
    operationCount += 1;
  });

  if (operationCount > 0) {
    await batch.commit();
  }

  return getTeacherAssignments(schoolId, teacherId);
}

export async function getAssignmentsForCurrentTeacher(schoolId, teacherId) {
  if (!teacherId) {
    return [];
  }

  const [assignments, assignablePairs] = await Promise.all([
    getTeacherAssignments(schoolId, teacherId),
    getAssignableClassSubjects(schoolId),
  ]);
  const assignablePairsById = new Map(
    assignablePairs.map((pair) => [pair.id, pair]),
  );
  const assignedPairs = assignments
    .map((assignment) =>
      assignablePairsById.get(
        getClassSubjectMappingId(assignment.classId, assignment.subjectId),
      ),
    )
    .filter(Boolean);

  return groupAssignmentPairs(assignedPairs);
}
