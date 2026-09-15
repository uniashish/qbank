import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../hooks/useAuth.js";
import { getAssignmentsForCurrentTeacher } from "../../../services/teacherAssignmentService.js";

const INITIAL_ASSIGNMENT_STATE = {
  assignmentGroups: [],
  error: "",
  isLoading: false,
};

export function useTeacherQuestionAssignments({ enabled = true } = {}) {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const [loadedAssignments, setLoadedAssignments] = useState({
    assignmentGroups: [],
    error: "",
    requestKey: "",
  });
  const teacherId = userProfile?.uid ?? "";
  const schoolId = userProfile?.schoolId ?? "";
  const shouldLoadAssignments =
    enabled && !isAuthLoading && Boolean(teacherId) && Boolean(schoolId);
  const requestKey = shouldLoadAssignments ? `${schoolId}:${teacherId}` : "";

  useEffect(() => {
    let isMounted = true;

    if (!requestKey) {
      return undefined;
    }

    getAssignmentsForCurrentTeacher(schoolId, teacherId)
      .then((assignmentGroups) => {
        if (isMounted) {
          setLoadedAssignments({
            assignmentGroups,
            error: "",
            requestKey,
          });
        }
      })
      .catch((error) => {
        console.error("[Question designer] Failed to load teacher assignments.", {
          error,
          schoolId,
          teacherId,
        });

        if (isMounted) {
          setLoadedAssignments({
            assignmentGroups: [],
            error: "Your class and subject assignments could not be loaded.",
            requestKey,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestKey, schoolId, teacherId]);

  const assignmentState = useMemo(() => {
    if (!enabled) {
      return INITIAL_ASSIGNMENT_STATE;
    }

    if (isAuthLoading) {
      return {
        ...INITIAL_ASSIGNMENT_STATE,
        isLoading: true,
      };
    }

    if (!teacherId || !schoolId) {
      return {
        assignmentGroups: [],
        error: "Your teacher account is not linked to a school.",
        isLoading: false,
      };
    }

    if (loadedAssignments.requestKey !== requestKey) {
      return {
        ...INITIAL_ASSIGNMENT_STATE,
        isLoading: true,
      };
    }

    return {
      assignmentGroups: loadedAssignments.assignmentGroups,
      error: loadedAssignments.error,
      isLoading: false,
    };
  }, [
    enabled,
    isAuthLoading,
    loadedAssignments.assignmentGroups,
    loadedAssignments.error,
    loadedAssignments.requestKey,
    requestKey,
    schoolId,
    teacherId,
  ]);

  const classOptions = useMemo(
    () =>
      assignmentState.assignmentGroups.map((group) => ({
        id: group.classRecord.id,
        label: group.classRecord.name,
        record: group.classRecord,
      })),
    [assignmentState.assignmentGroups],
  );

  const subjectsByClassId = useMemo(() => {
    const groupedSubjects = new Map();

    assignmentState.assignmentGroups.forEach((group) => {
      groupedSubjects.set(group.classRecord.id, group.subjects);
    });

    return groupedSubjects;
  }, [assignmentState.assignmentGroups]);

  const getSubjectsForClass = useCallback(
    (classId) => subjectsByClassId.get(classId) ?? [],
    [subjectsByClassId],
  );

  const getSubjectIdsForClass = useCallback(
    (classId) => getSubjectsForClass(classId).map((subject) => subject.id),
    [getSubjectsForClass],
  );

  return {
    ...assignmentState,
    classOptions,
    getSubjectIdsForClass,
    getSubjectsForClass,
    hasAssignments: classOptions.length > 0,
  };
}
