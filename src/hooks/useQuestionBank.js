import { useCallback, useEffect, useMemo, useState } from "react";

import { DIFFICULTY_LEVEL_OPTIONS } from "../features/question-designer/constants/difficultyLevels.js";
import {
  getQuestionTypeOption,
  QUESTION_TYPE_OPTIONS,
} from "../features/question-designer/constants/questionTypes.js";
import { getTeacherQuestions } from "../services/questionBankService.js";
import { getAssignmentsForCurrentTeacher } from "../services/teacherAssignmentService.js";
import {
  filterQuestionBankQuestions,
  hasQuestionBankFilters,
} from "../utils/questionBankFilters.js";
import { useAuth } from "./useAuth.js";

const INITIAL_FILTERS = {
  classId: "",
  difficulty: "",
  questionType: "",
  subjectId: "",
  topicName: "",
};

function resolveDifficultyLabel(difficulty) {
  return (
    DIFFICULTY_LEVEL_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? "Unknown"
  );
}

function createAcademicLookups(assignmentGroups = []) {
  const classOptions = assignmentGroups.map((group) => ({
    id: group.classRecord.id,
    label: group.classRecord.name,
    record: group.classRecord,
  }));
  const classById = new Map(
    classOptions.map((classOption) => [classOption.id, classOption.record]),
  );
  const subjectsByClassId = new Map();
  const subjectById = new Map();

  assignmentGroups.forEach((group) => {
    subjectsByClassId.set(group.classRecord.id, group.subjects);
    group.subjects.forEach((subject) => {
      if (!subjectById.has(subject.id)) {
        subjectById.set(subject.id, subject);
      }
    });
  });

  return {
    classById,
    classOptions,
    subjectById,
    subjectsByClassId,
  };
}

function createTopicOptions(questions = []) {
  return [...new Set(questions.map((question) => question.topicName).filter(Boolean))]
    .sort((firstTopic, secondTopic) => firstTopic.localeCompare(secondTopic))
    .map((topicName) => ({
      id: topicName,
      label: topicName,
    }));
}

function enrichQuestion(question, academicLookups) {
  const classRecord = academicLookups.classById.get(question.classId);
  const subject = academicLookups.subjectById.get(question.subjectId);
  const questionTypeOption = getQuestionTypeOption(question.questionType);

  return {
    ...question,
    className: classRecord?.name ?? "Unavailable class",
    difficultyLabel: resolveDifficultyLabel(question.difficulty),
    questionTypeLabel: questionTypeOption?.title ?? "Unknown type",
    subjectName: subject?.name ?? "Unavailable subject",
  };
}

export function useQuestionBank() {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const [loadedQuestionBank, setLoadedQuestionBank] = useState({
    assignmentGroups: [],
    error: "",
    questions: [],
    requestKey: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const schoolId = userProfile?.schoolId ?? "";
  const teacherId = userProfile?.uid ?? "";
  const requestKey = !isAuthLoading && schoolId && teacherId
    ? `${schoolId}:${teacherId}`
    : "";

  const loadQuestionBank = useCallback(async () => {
    const [loadedQuestions, loadedAssignmentGroups] = await Promise.all([
      getTeacherQuestions(schoolId, teacherId),
      getAssignmentsForCurrentTeacher(schoolId, teacherId),
    ]);

    return {
      assignmentGroups: loadedAssignmentGroups,
      questions: loadedQuestions,
    };
  }, [schoolId, teacherId]);

  const refreshQuestions = useCallback(async () => {
    if (!schoolId || !teacherId) {
      return;
    }

    const loadedQuestionBank = await loadQuestionBank();

    setLoadedQuestionBank({
      ...loadedQuestionBank,
      error: "",
      requestKey: `${schoolId}:${teacherId}`,
    });
  }, [loadQuestionBank, schoolId, teacherId]);

  useEffect(() => {
    let isMounted = true;

    if (!requestKey) {
      return undefined;
    }

    loadQuestionBank()
      .then((loadedQuestionBank) => {
        if (!isMounted) {
          return;
        }

        setLoadedQuestionBank({
          ...loadedQuestionBank,
          error: "",
          requestKey,
        });
      })
      .catch((loadError) => {
        console.error("[Question bank] Failed to load questions.", {
          error: loadError,
          schoolId,
          teacherId,
        });

        if (isMounted) {
          setLoadedQuestionBank({
            assignmentGroups: [],
            error: "Questions could not be loaded.",
            questions: [],
            requestKey,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadQuestionBank, requestKey, schoolId, teacherId]);

  const isLoading =
    isAuthLoading ||
    (Boolean(requestKey) && loadedQuestionBank.requestKey !== requestKey);
  const error =
    !isAuthLoading && !requestKey
      ? "Your teacher account is not linked to a school."
      : loadedQuestionBank.error;

  const academicLookups = useMemo(
    () => createAcademicLookups(loadedQuestionBank.assignmentGroups),
    [loadedQuestionBank.assignmentGroups],
  );
  const enrichedQuestions = useMemo(
    () =>
      loadedQuestionBank.questions.map((question) =>
        enrichQuestion(question, academicLookups),
      ),
    [academicLookups, loadedQuestionBank.questions],
  );
  const topicOptions = useMemo(
    () => createTopicOptions(enrichedQuestions),
    [enrichedQuestions],
  );
  const subjectOptions = useMemo(() => {
    if (filters.classId) {
      return academicLookups.subjectsByClassId.get(filters.classId) ?? [];
    }

    return [...academicLookups.subjectById.values()].sort((firstSubject, secondSubject) =>
      firstSubject.name.localeCompare(secondSubject.name),
    );
  }, [academicLookups, filters.classId]);
  const filteredQuestions = useMemo(
    () =>
      filterQuestionBankQuestions(enrichedQuestions, {
        filters,
        searchTerm,
      }),
    [enrichedQuestions, filters, searchTerm],
  );
  const hasActiveFilters = hasQuestionBankFilters(filters, searchTerm);

  const updateFilter = useCallback(
    (filterName, value) => {
      setFilters((currentFilters) => {
        const nextFilters = {
          ...currentFilters,
          [filterName]: value,
        };

        if (filterName === "classId") {
          const validSubjectIds = new Set(
            (academicLookups.subjectsByClassId.get(value) ?? []).map(
              (subject) => subject.id,
            ),
          );

          if (!value || !validSubjectIds.has(currentFilters.subjectId)) {
            nextFilters.subjectId = "";
          }
        }

        return nextFilters;
      });
    },
    [academicLookups.subjectsByClassId],
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
  }, []);

  return {
    classOptions: academicLookups.classOptions,
    clearFilters,
    difficultyOptions: DIFFICULTY_LEVEL_OPTIONS,
    error,
    filters,
    hasActiveFilters,
    isLoading,
    questionTypeOptions: QUESTION_TYPE_OPTIONS,
    questions: filteredQuestions,
    refreshQuestions,
    schoolId,
    searchTerm,
    setSearchTerm,
    subjectOptions,
    teacherId,
    topicOptions,
    totalQuestionCount: enrichedQuestions.length,
    updateFilter,
  };
}
