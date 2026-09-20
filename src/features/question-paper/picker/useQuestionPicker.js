import { useCallback, useMemo, useState } from "react";

import { useQuestionBank } from "../../../hooks/useQuestionBank.js";

function createQuestionMap(questions) {
  return new Map(questions.map((question) => [question.id, question]));
}

function getQuestionMarks(question) {
  const marks = Number(question?.marks ?? 0);

  return Number.isFinite(marks) ? marks : 0;
}

export function useQuestionPicker({ alreadyAddedQuestionIds = [] } = {}) {
  const questionBank = useQuestionBank();
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const alreadyAddedQuestionIdSet = useMemo(
    () => new Set(alreadyAddedQuestionIds),
    [alreadyAddedQuestionIds],
  );
  const questionById = useMemo(
    () => createQuestionMap(questionBank.allQuestions),
    [questionBank.allQuestions],
  );
  const selectedQuestions = useMemo(
    () =>
      selectedQuestionIds
        .map((questionId) => questionById.get(questionId))
        .filter(Boolean),
    [questionById, selectedQuestionIds],
  );
  const selectedMarksTotal = useMemo(
    () =>
      selectedQuestions.reduce(
        (totalMarks, question) => totalMarks + getQuestionMarks(question),
        0,
      ),
    [selectedQuestions],
  );

  const setQuestionSelected = useCallback(
    (question, isSelected) => {
      if (!question?.id || alreadyAddedQuestionIdSet.has(question.id)) {
        return;
      }

      setSelectedQuestionIds((currentIds) => {
        const hasQuestion = currentIds.includes(question.id);

        if (isSelected && !hasQuestion) {
          return [...currentIds, question.id];
        }

        if (!isSelected && hasQuestion) {
          return currentIds.filter((questionId) => questionId !== question.id);
        }

        return currentIds;
      });
    },
    [alreadyAddedQuestionIdSet],
  );

  const clearSelection = useCallback(() => {
    setSelectedQuestionIds([]);
  }, []);

  return {
    ...questionBank,
    alreadyAddedQuestionIdSet,
    clearSelection,
    selectedMarksTotal,
    selectedQuestionIds,
    selectedQuestions,
    setQuestionSelected,
  };
}
