import { useCallback, useEffect, useMemo, useState } from "react";

import {
  buildAssignmentGroups,
} from "../../components/teacher-assignments/assignmentSelectionUtils.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getAssignableClassSubjects } from "../../services/teacherAssignmentService.js";
import {
  getActiveSchoolAdminsForSchool,
  getActiveTeachersForSchool,
  getPendingJoinRequestsForSchool,
} from "./schoolUsersService.js";

export function useSchoolUsers() {
  const { firebaseUser, userProfile } = useAuth();
  const schoolId = userProfile?.schoolId ?? "";
  const [joinRequests, setJoinRequests] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schoolAdmins, setSchoolAdmins] = useState([]);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const refresh = useCallback(async () => {
    if (!schoolId) {
      setPageError("No school is linked to this account.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setPageError("");

    try {
      const [
        nextJoinRequests,
        nextTeachers,
        nextSchoolAdmins,
        assignablePairs,
      ] = await Promise.all([
        getPendingJoinRequestsForSchool(schoolId),
        getActiveTeachersForSchool(schoolId),
        getActiveSchoolAdminsForSchool(schoolId),
        getAssignableClassSubjects(schoolId),
      ]);

      setJoinRequests(nextJoinRequests);
      setTeachers(nextTeachers);
      setSchoolAdmins(nextSchoolAdmins);
      setAssignmentGroups(buildAssignmentGroups(assignablePairs));
    } catch (error) {
      console.error("[School users] Failed to load school users.", {
        error,
        schoolId,
      });
      setPageError("School users could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      if (!isMounted) {
        return;
      }

      await refresh();
    }

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  return useMemo(
    () => ({
      assignmentGroups,
      currentUserId: firebaseUser?.uid ?? "",
      isLoading,
      joinRequests,
      pageError,
      refresh,
      schoolAdmins,
      schoolId,
      teachers,
    }),
    [
      assignmentGroups,
      firebaseUser?.uid,
      isLoading,
      joinRequests,
      pageError,
      refresh,
      schoolAdmins,
      schoolId,
      teachers,
    ],
  );
}
