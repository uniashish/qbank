import { getClassSubjectMappingId } from "../../services/classSubjectService.js";

export function buildAssignmentGroups(assignablePairs) {
  const groupsByClassId = new Map();

  assignablePairs.forEach((pair) => {
    if (!groupsByClassId.has(pair.classId)) {
      groupsByClassId.set(pair.classId, {
        classRecord: pair.classRecord,
        subjects: [],
      });
    }

    groupsByClassId.get(pair.classId).subjects.push(pair.subject);
  });

  return [...groupsByClassId.values()].map((group) => ({
    ...group,
    subjects: group.subjects.sort((firstSubject, secondSubject) =>
      firstSubject.name.localeCompare(secondSubject.name),
    ),
  }));
}

export function buildSelectionsFromAssignments(assignments, assignablePairIds) {
  const selections = {};

  assignments.forEach((assignment) => {
    const pairId = getClassSubjectMappingId(
      assignment.classId,
      assignment.subjectId,
    );

    if (!assignablePairIds.has(pairId)) {
      return;
    }

    selections[assignment.classId] = [
      ...new Set([...(selections[assignment.classId] ?? []), assignment.subjectId]),
    ].sort();
  });

  return selections;
}

export function countSelections(selections) {
  return Object.values(selections).reduce(
    (total, subjectIds) => total + subjectIds.length,
    0,
  );
}

export function getSelectionPairIds(selections) {
  return new Set(
    Object.entries(selections).flatMap(([classId, subjectIds]) =>
      subjectIds.map((subjectId) => getClassSubjectMappingId(classId, subjectId)),
    ),
  );
}

export function countDirtySelections(currentSelections, savedSelections) {
  const currentPairIds = getSelectionPairIds(currentSelections);
  const savedPairIds = getSelectionPairIds(savedSelections);
  let dirtyCount = 0;

  currentPairIds.forEach((pairId) => {
    if (!savedPairIds.has(pairId)) {
      dirtyCount += 1;
    }
  });

  savedPairIds.forEach((pairId) => {
    if (!currentPairIds.has(pairId)) {
      dirtyCount += 1;
    }
  });

  return dirtyCount;
}
