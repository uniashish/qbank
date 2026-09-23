import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../../hooks/useAuth.js";
import { getCurrentTeacherQuestionPaperTemplates } from "../services/questionPaperTemplateService.js";

export function useQuestionPaperTemplates() {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const [templateState, setTemplateState] = useState({
    error: "",
    requestKey: "",
    templates: [],
  });
  const requestKey =
    !isAuthLoading && userProfile?.schoolId && userProfile?.uid
      ? `${userProfile.schoolId}:${userProfile.uid}`
      : "";

  const loadTemplates = useCallback(async () => {
    return getCurrentTeacherQuestionPaperTemplates(userProfile);
  }, [userProfile]);

  const refresh = useCallback(async () => {
    if (!requestKey) {
      return;
    }

    try {
      const templates = await loadTemplates();

      setTemplateState({
        error: "",
        requestKey,
        templates,
      });
    } catch (error) {
      console.error("[Question paper template] Failed to refresh templates.", {
        error,
      });

      setTemplateState({
        error: "Question paper templates could not be loaded.",
        requestKey,
        templates: [],
      });
    }
  }, [loadTemplates, requestKey]);

  useEffect(() => {
    let isMounted = true;

    if (!requestKey) {
      return undefined;
    }

    loadTemplates()
      .then((templates) => {
        if (!isMounted) {
          return;
        }

        setTemplateState({
          error: "",
          requestKey,
          templates,
        });
      })
      .catch((error) => {
        console.error("[Question paper template] Failed to load templates.", {
          error,
        });

        if (isMounted) {
          setTemplateState({
            error: "Question paper templates could not be loaded.",
            requestKey,
            templates: [],
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadTemplates, requestKey]);

  const loading =
    isAuthLoading ||
    (Boolean(requestKey) && templateState.requestKey !== requestKey);
  const error =
    !isAuthLoading && !requestKey
      ? "Your teacher account is not linked to a school."
      : templateState.error;

  return {
    error,
    loading,
    refresh,
    templates: templateState.templates,
  };
}
