import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../hooks/useAuth.js";
import {
  getActiveQuestionSharesForOwner,
  getActiveTeachersForSharing,
} from "./questionSharingService.js";

export function useQuestionSharing({ questionIds = [] } = {}) {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const [loadedSharing, setLoadedSharing] = useState({
    error: "",
    requestKey: "",
    shares: [],
    teachers: [],
  });
  const schoolId = userProfile?.schoolId ?? "";
  const teacherId = userProfile?.uid ?? "";
  const requestKey = !isAuthLoading && schoolId && teacherId
    ? `${schoolId}:${teacherId}`
    : "";

  const loadSharing = useCallback(async () => {
    const [teachers, shares] = await Promise.all([
      getActiveTeachersForSharing({
        currentTeacherId: teacherId,
        schoolId,
      }),
      getActiveQuestionSharesForOwner({
        ownerId: teacherId,
        schoolId,
      }),
    ]);

    return {
      shares,
      teachers,
    };
  }, [schoolId, teacherId]);

  const refreshSharing = useCallback(async () => {
    if (!schoolId || !teacherId) {
      return;
    }

    const sharing = await loadSharing();

    setLoadedSharing({
      ...sharing,
      error: "",
      requestKey: `${schoolId}:${teacherId}`,
    });
  }, [loadSharing, schoolId, teacherId]);

  useEffect(() => {
    let isMounted = true;

    if (!requestKey) {
      return undefined;
    }

    loadSharing()
      .then((sharing) => {
        if (!isMounted) {
          return;
        }

        setLoadedSharing({
          ...sharing,
          error: "",
          requestKey,
        });
      })
      .catch((loadError) => {
        console.error("[Question sharing] Failed to load sharing data.", {
          error: loadError,
          schoolId,
          teacherId,
        });

        if (isMounted) {
          setLoadedSharing({
            error: "Sharing options could not be loaded.",
            requestKey,
            shares: [],
            teachers: [],
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadSharing, requestKey, schoolId, teacherId]);

  const selectedQuestionIdSet = useMemo(
    () => new Set(questionIds.filter(Boolean)),
    [questionIds],
  );
  const shareStateByTeacherId = useMemo(() => {
    const states = new Map();

    loadedSharing.shares.forEach((share) => {
      if (!selectedQuestionIdSet.has(share.questionId)) {
        return;
      }

      if (!states.has(share.sharedWithTeacherId)) {
        states.set(share.sharedWithTeacherId, {
          activeShareIds: [],
          activeShareQuestionIds: new Set(),
        });
      }

      const state = states.get(share.sharedWithTeacherId);

      state.activeShareIds.push(share.id);
      state.activeShareQuestionIds.add(share.questionId);
    });

    return states;
  }, [loadedSharing.shares, selectedQuestionIdSet]);
  const isLoading =
    isAuthLoading ||
    (Boolean(requestKey) && loadedSharing.requestKey !== requestKey);
  const error =
    !isAuthLoading && !requestKey
      ? "Your teacher account is not linked to a school."
      : loadedSharing.error;

  return {
    error,
    existingShares: loadedSharing.shares,
    isLoading,
    refreshSharing,
    schoolId,
    shareStateByTeacherId,
    teacherId,
    teachers: loadedSharing.teachers,
  };
}
