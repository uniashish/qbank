import { useCallback, useEffect, useMemo, useState } from "react";

import { DIFFICULTY_LEVEL_OPTIONS } from "../features/question-designer/constants/difficultyLevels.js";
import {
  getQuestionTypeOption,
  QUESTION_TYPE_OPTIONS,
} from "../features/question-designer/constants/questionTypes.js";
import { getClassesForSchool } from "../services/classService.js";
import { getTeacherQuestions } from "../services/questionBankService.js";
import { getSubjectsForSchool } from "../services/subjectService.js";
import {
  filterQuestionBankQuestions,
  hasQuestionBankFilters,
} from "../utils/questionBankFilters.js";
import { sanitizeTags } from "../components/tags/tagUtils.js";
import { useAuth } from "./useAuth.js";

const INITIAL_FILTERS = {
  classId: "",
  difficulty: "",
  questionType: "",
  subjectId: "",
  tag: "",
  topicName: "",
};

function resolveDifficultyLabel(difficulty) {
  return (
    DIFFICULTY_LEVEL_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? "Unknown"
  );
}

function createAcademicLookups(classes = [], subjects = []) {
  const classById = new Map(classes.map((classRecord) => [classRecord.id, classRecord]));
  const subjectById = new Map(subjects.map((subject) => [subject.id, subject]));

  return {
    classById,
    subjectById,
  };
}

function createClassOptions(questions = [], classById) {
  const classIds = [...new Set(questions.map((question) => question.classId))]
    .filter(Boolean)
    .sort((firstClassId, secondClassId) => {
      const firstClassName = classById.get(firstClassId)?.name ?? firstClassId;
      const secondClassName = classById.get(secondClassId)?.name ?? secondClassId;

      return firstClassName.localeCompare(secondClassName);
    });

  return classIds.map((classId) => ({
    id: classId,
    label: classById.get(classId)?.name ?? "Unavailable class",
    record: classById.get(classId) ?? null,
  }));
}

function createSubjectOptions(questions = [], subjectById, classId = "") {
  const subjectIds = [
    ...new Set(
      questions
        .filter((question) => !classId || question.classId === classId)
        .map((question) => question.subjectId),
    ),
  ]
    .filter(Boolean)
    .sort((firstSubjectId, secondSubjectId) => {
      const firstSubjectName = subjectById.get(firstSubjectId)?.name ?? firstSubjectId;
      const secondSubjectName =
        subjectById.get(secondSubjectId)?.name ?? secondSubjectId;

      return firstSubjectName.localeCompare(secondSubjectName);
    });

  return subjectIds.map((subjectId) => ({
    id: subjectId,
    name: subjectById.get(subjectId)?.name ?? "Unavailable subject",
  }));
}

function createTopicOptions(questions = []) {
  return [...new Set(questions.map((question) => question.topicName).filter(Boolean))]
    .sort((firstTopic, secondTopic) => firstTopic.localeCompare(secondTopic))
    .map((topicName) => ({
      id: topicName,
      label: topicName,
    }));
}

function createTagOptions(questions = []) {
  return [
    ...new Map(
      questions
        .flatMap((question) => question.tags ?? [])
        .filter(Boolean)
        .map((tag) => [tag.toLowerCase(), tag]),
    ).values(),
  ]
    .sort((firstTag, secondTag) => firstTag.localeCompare(secondTag))
    .map((tag) => ({
      id: tag,
      label: tag,
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
    tags: sanitizeTags(question.tags),
  };
}

export function useQuestionBank({ ownedOnly = false } = {}) {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const [loadedQuestionBank, setLoadedQuestionBank] = useState({
    classes: [],
    error: "",
    questions: [],
    requestKey: "",
    subjects: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const schoolId = userProfile?.schoolId ?? "";
  const teacherId = userProfile?.uid ?? "";
  const requestKey = !isAuthLoading && schoolId && teacherId
    ? `${schoolId}:${teacherId}:${ownedOnly ? "owned" : "all"}`
    : "";

  const loadQuestionBank = useCallback(async () => {
    const [loadedQuestions, loadedClasses, loadedSubjects] = await Promise.all([
      getTeacherQuestions(schoolId, teacherId, { ownedOnly }),
      getClassesForSchool(schoolId),
      getSubjectsForSchool(schoolId),
    ]);

    return {
      classes: loadedClasses,
      questions: loadedQuestions,
      subjects: loadedSubjects,
    };
  }, [ownedOnly, schoolId, teacherId]);

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
            classes: [],
            error: "Questions could not be loaded.",
            questions: [],
            requestKey,
            subjects: [],
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
    () =>
      createAcademicLookups(
        loadedQuestionBank.classes,
        loadedQuestionBank.subjects,
      ),
    [loadedQuestionBank.classes, loadedQuestionBank.subjects],
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
  const tagOptions = useMemo(
    () => createTagOptions(enrichedQuestions),
    [enrichedQuestions],
  );
  const classOptions = useMemo(
    () => createClassOptions(enrichedQuestions, academicLookups.classById),
    [academicLookups.classById, enrichedQuestions],
  );
  const subjectOptions = useMemo(
    () =>
      createSubjectOptions(
        enrichedQuestions,
        academicLookups.subjectById,
        filters.classId,
      ),
    [academicLookups.subjectById, enrichedQuestions, filters.classId],
  );
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
            enrichedQuestions
              .filter((question) => !value || question.classId === value)
              .map((question) => question.subjectId),
          );

          if (!value || !validSubjectIds.has(currentFilters.subjectId)) {
            nextFilters.subjectId = "";
          }
        }

        return nextFilters;
      });
    },
    [enrichedQuestions],
  );

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSearchTerm("");
  }, []);

  return {
    allQuestions: enrichedQuestions,
    classOptions,
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
    tagOptions,
    teacherId,
    topicOptions,
    totalQuestionCount: enrichedQuestions.length,
    updateFilter,
  };
}
