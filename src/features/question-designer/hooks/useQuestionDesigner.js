import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  hasQuestionTypeEditorValidationErrors,
  isQuestionTypeEditorValid,
  validateQuestionTypeEditor,
} from "../editors/questionTypeEditorValidation.js";
import { syncBlankAnswers } from "../editors/fill-blanks/fillBlanksUtils.js";
import {
  MAX_MATCH_FOLLOWING_PAIRS,
  MIN_MATCH_FOLLOWING_PAIRS,
} from "../editors/match-following/matchFollowingValidation.js";
import {
  MAX_MULTIPLE_CHOICE_OPTIONS,
  MIN_MULTIPLE_CHOICE_OPTIONS,
} from "../editors/multiple-choice/multipleChoiceValidation.js";
import {
  createMatchPair,
  getMatchPairIdCounterSeed,
  normalizeMatchPairs,
} from "../utils/matchPairHelpers.js";
import {
  getRichTextPlainText,
  normalizeRichTextContent,
} from "../utils/richTextContent.js";
import {
  isQuestionDetailsValid,
  validateQuestionDetails,
} from "../validation/questionDetailsValidation.js";
import { QUESTION_TYPES } from "../constants/questionTypes.js";
import { sanitizeTags } from "../../../components/tags/tagUtils.js";

const INITIAL_MULTIPLE_CHOICE_OPTIONS = Array.from(
  { length: MIN_MULTIPLE_CHOICE_OPTIONS },
  (_, index) => ({
    content: normalizeRichTextContent(""),
    id: `opt-${index + 1}`,
    text: "",
  }),
);

const INITIAL_DESIGNER_STATE = {
  classId: null,
  currentStep: 1,
  difficulty: null,
  instructions: "",
  marks: 1,
  mode: "create",
  prompt: "",
  promptContent: normalizeRichTextContent(""),
  questionType: null,
  subjectId: null,
  tags: [],
  topicName: "",
};

function createInitialQuestionImageState() {
  return {
    downloadUrl: null,
    error: "",
    file: null,
    isLoading: false,
    previewUrl: null,
    storagePath: null,
  };
}

function createInitialFillBlanksState() {
  return {
    blanks: [],
  };
}

function createInitialMultipleChoiceState() {
  return {
    correctOptionId: null,
    options: INITIAL_MULTIPLE_CHOICE_OPTIONS.map((option) => ({ ...option })),
  };
}

function createInitialMatchFollowingState() {
  return {
    pairs: normalizeMatchPairs([], { minPairs: MIN_MATCH_FOLLOWING_PAIRS }),
  };
}

function createInitialTrueFalseState() {
  return {
    correctAnswer: null,
  };
}

function createInitialShortAnswerState() {
  return {
    modelAnswer: null,
    questionContent: null,
  };
}

function createInitialLongAnswerState() {
  return {
    modelAnswer: null,
    questionContent: null,
    suggestedWordCount: null,
  };
}

export function createInitialQuestionDesignerState(overrides = {}) {
  return {
    ...INITIAL_DESIGNER_STATE,
    fillBlanks: createInitialFillBlanksState(),
    longAnswer: createInitialLongAnswerState(),
    matchFollowing: createInitialMatchFollowingState(),
    multipleChoice: createInitialMultipleChoiceState(),
    questionImage: createInitialQuestionImageState(),
    shortAnswer: createInitialShortAnswerState(),
    trueFalse: createInitialTrueFalseState(),
    ...overrides,
  };
}

function getFillBlanksState(question = {}) {
  const blanks = Array.isArray(question.answerData?.blanks)
    ? question.answerData.blanks
    : [];

  return syncBlankAnswers(
    {
      blanks: blanks.map((blank, index) => ({
        id: blank.id || `blank-${index + 1}`,
        acceptedAnswers:
          Array.isArray(blank.acceptedAnswers) &&
          blank.acceptedAnswers.length > 0
            ? blank.acceptedAnswers.map((answer) => String(answer ?? ""))
            : [""],
      })),
    },
    question.prompt ?? getRichTextPlainText(question.promptContent),
  );
}

function getQuestionImageState(question = {}) {
  return {
    ...createInitialQuestionImageState(),
    downloadUrl: question.image?.downloadUrl ?? null,
    storagePath: question.image?.storagePath ?? null,
  };
}

function getMultipleChoiceState(question = {}) {
  const options = Array.isArray(question.answerData?.options)
    ? question.answerData.options
    : [];

  if (options.length === 0) {
    return createInitialMultipleChoiceState();
  }

  return {
    correctOptionId: question.answerData?.correctOptionId ?? null,
    options: options.map((option, index) => ({
      content: normalizeRichTextContent(option.content, option.text ?? ""),
      id: option.id || `opt-${index + 1}`,
      text: option.text ?? getRichTextPlainText(option.content),
    })),
  };
}

function getMatchFollowingState(question = {}) {
  return {
    pairs: normalizeMatchPairs(question.answerData?.pairs, {
      minPairs: MIN_MATCH_FOLLOWING_PAIRS,
    }),
  };
}

function getTrueFalseState(question = {}) {
  const correctAnswer = question.answerData?.correctAnswer;

  return {
    correctAnswer:
      correctAnswer === true || correctAnswer === false ? correctAnswer : null,
  };
}

function getShortAnswerState(question = {}) {
  return {
    modelAnswer: question.answerData?.modelAnswer ?? null,
    questionContent: question.answerData?.questionContent ?? null,
  };
}

function getLongAnswerState(question = {}) {
  return {
    modelAnswer: question.answerData?.modelAnswer ?? null,
    questionContent: question.answerData?.questionContent ?? null,
    suggestedWordCount: question.answerData?.suggestedWordCount ?? null,
  };
}

function getMultipleChoiceOptionCounterSeed(options = []) {
  return options.reduce((highestOptionNumber, option, index) => {
    const optionNumber = Number(String(option.id ?? "").replace(/^opt-/, ""));

    return Number.isInteger(optionNumber) && optionNumber > highestOptionNumber
      ? optionNumber
      : Math.max(highestOptionNumber, index + 1);
  }, INITIAL_MULTIPLE_CHOICE_OPTIONS.length);
}

function hasSupportedQuestionTypeEditor(questionType) {
  return (
    questionType === QUESTION_TYPES.FILL_BLANKS ||
    questionType === QUESTION_TYPES.LONG_ANSWER ||
    questionType === QUESTION_TYPES.MATCH_FOLLOWING ||
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE ||
    questionType === QUESTION_TYPES.SHORT_ANSWER ||
    questionType === QUESTION_TYPES.TRUE_FALSE
  );
}

function createQuestionDesignerStateFromQuestion(question, mode) {
  if (!question) {
    return createInitialQuestionDesignerState({ mode });
  }

  return createInitialQuestionDesignerState({
    classId: question.classId ?? null,
    currentStep: hasSupportedQuestionTypeEditor(question.questionType) ? 2 : 1,
    difficulty: question.difficulty ?? null,
    fillBlanks: getFillBlanksState(question),
    instructions: question.instructions ?? "",
    longAnswer: getLongAnswerState(question),
    matchFollowing: getMatchFollowingState(question),
    marks: question.marks ?? 1,
    mode,
    multipleChoice: getMultipleChoiceState(question),
    prompt: question.prompt ?? "",
    promptContent: normalizeRichTextContent(
      question.promptContent,
      question.prompt ?? "",
    ),
    questionImage: getQuestionImageState(question),
    questionType: question.questionType ?? null,
    shortAnswer: getShortAnswerState(question),
    subjectId: question.subjectId ?? null,
    tags: sanitizeTags(question.tags),
    topicName: question.topicName ?? "",
    trueFalse: getTrueFalseState(question),
  });
}

export function useQuestionDesigner({ initialQuestion = null, mode = "create" } = {}) {
  const imagePreviewUrlRef = useRef(null);
  const matchPairIdCounterRef = useRef(MIN_MATCH_FOLLOWING_PAIRS);
  const optionIdCounterRef = useRef(INITIAL_MULTIPLE_CHOICE_OPTIONS.length);
  const [designerState, setDesignerState] = useState(() =>
    createQuestionDesignerStateFromQuestion(initialQuestion, mode),
  );

  const revokeQuestionImagePreview = useCallback(() => {
    if (!imagePreviewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(imagePreviewUrlRef.current);
    imagePreviewUrlRef.current = null;
  }, []);

  const resetDesigner = useCallback(() => {
    revokeQuestionImagePreview();
    const nextDesignerState = createQuestionDesignerStateFromQuestion(
      initialQuestion,
      mode,
    );
    optionIdCounterRef.current = getMultipleChoiceOptionCounterSeed(
      nextDesignerState.multipleChoice.options,
    );
    matchPairIdCounterRef.current = getMatchPairIdCounterSeed(
      nextDesignerState.matchFollowing.pairs,
    );
    setDesignerState(nextDesignerState);
  }, [initialQuestion, mode, revokeQuestionImagePreview]);

  useEffect(() => revokeQuestionImagePreview, [revokeQuestionImagePreview]);

  const selectQuestionType = useCallback((questionType) => {
    setDesignerState((currentState) => ({
      ...currentState,
      fillBlanks:
        questionType === QUESTION_TYPES.FILL_BLANKS
          ? syncBlankAnswers(currentState.fillBlanks, currentState.prompt)
          : currentState.fillBlanks,
      questionType,
    }));
  }, []);

  const setAssignedClass = useCallback((classId, validSubjectIds = []) => {
    setDesignerState((currentState) => {
      const nextClassId = classId || null;
      const shouldKeepSubject =
        nextClassId &&
        currentState.subjectId &&
        validSubjectIds.includes(currentState.subjectId);

      return {
        ...currentState,
        classId: nextClassId,
        subjectId: shouldKeepSubject ? currentState.subjectId : null,
      };
    });
  }, []);

  const setAssignedSubject = useCallback((subjectId) => {
    setDesignerState((currentState) => ({
      ...currentState,
      subjectId: subjectId || null,
    }));
  }, []);

  const updateQuestionDetail = useCallback((fieldName, value) => {
    setDesignerState((currentState) => {
      const isPromptContentUpdate = fieldName === "promptContent";
      const derivedPrompt = isPromptContentUpdate
        ? getRichTextPlainText(value)
        : value;
      const nextState = {
        ...currentState,
        [fieldName]: value,
        ...(isPromptContentUpdate ? { prompt: derivedPrompt } : {}),
      };

      if (
        (fieldName === "prompt" || isPromptContentUpdate) &&
        currentState.questionType === QUESTION_TYPES.FILL_BLANKS
      ) {
        nextState.fillBlanks = syncBlankAnswers(
          currentState.fillBlanks,
          derivedPrompt,
        );
      }

      return nextState;
    });
  }, []);

  const setQuestionImage = useCallback(
    (file) => {
      if (!file) {
        return;
      }

      revokeQuestionImagePreview();

      const previewUrl = URL.createObjectURL(file);
      imagePreviewUrlRef.current = previewUrl;

      setDesignerState((currentState) => ({
        ...currentState,
        questionImage: {
          ...createInitialQuestionImageState(),
          file,
          previewUrl,
        },
      }));
    },
    [revokeQuestionImagePreview],
  );

  const setQuestionImageError = useCallback((errorMessage) => {
    setDesignerState((currentState) => ({
      ...currentState,
      questionImage: {
        ...currentState.questionImage,
        error: errorMessage,
      },
    }));
  }, []);

  const removeQuestionImage = useCallback(() => {
    revokeQuestionImagePreview();

    setDesignerState((currentState) => ({
      ...currentState,
      questionImage: createInitialQuestionImageState(),
    }));
  }, [revokeQuestionImagePreview]);

  const addMultipleChoiceOption = useCallback(() => {
    optionIdCounterRef.current += 1;

    const nextOption = {
      content: normalizeRichTextContent(""),
      id: `opt-${optionIdCounterRef.current}`,
      text: "",
    };

    setDesignerState((currentState) => {
      if (
        currentState.multipleChoice.options.length >=
        MAX_MULTIPLE_CHOICE_OPTIONS
      ) {
        return currentState;
      }

      return {
        ...currentState,
        multipleChoice: {
          ...currentState.multipleChoice,
          options: [...currentState.multipleChoice.options, nextOption],
        },
      };
    });
  }, []);

  const updateMultipleChoiceOption = useCallback((optionId, content) => {
    setDesignerState((currentState) => ({
      ...currentState,
      multipleChoice: {
        ...currentState.multipleChoice,
        options: currentState.multipleChoice.options.map((option) =>
          option.id === optionId
            ? {
                ...option,
                content,
                text: getRichTextPlainText(content),
              }
            : option,
        ),
      },
    }));
  }, []);

  const removeMultipleChoiceOption = useCallback((optionId) => {
    setDesignerState((currentState) => {
      if (
        currentState.multipleChoice.options.length <=
          MIN_MULTIPLE_CHOICE_OPTIONS ||
        !currentState.multipleChoice.options.some(
          (option) => option.id === optionId,
        )
      ) {
        return currentState;
      }

      const nextOptions = currentState.multipleChoice.options.filter(
        (option) => option.id !== optionId,
      );

      return {
        ...currentState,
        multipleChoice: {
          ...currentState.multipleChoice,
          correctOptionId:
            currentState.multipleChoice.correctOptionId === optionId
              ? null
              : currentState.multipleChoice.correctOptionId,
          options: nextOptions,
        },
      };
    });
  }, []);

  const setCorrectMultipleChoiceOption = useCallback((optionId) => {
    setDesignerState((currentState) => ({
      ...currentState,
      multipleChoice: {
        ...currentState.multipleChoice,
        correctOptionId: optionId,
      },
    }));
  }, []);

  const addMatchFollowingPair = useCallback(() => {
    setDesignerState((currentState) => {
      if (currentState.matchFollowing.pairs.length >= MAX_MATCH_FOLLOWING_PAIRS) {
        return currentState;
      }

      matchPairIdCounterRef.current += 1;

      return {
        ...currentState,
        matchFollowing: {
          ...currentState.matchFollowing,
          pairs: [
            ...currentState.matchFollowing.pairs,
            createMatchPair(matchPairIdCounterRef.current),
          ],
        },
      };
    });
  }, []);

  const updateMatchFollowingPair = useCallback((pairId, fieldName, value) => {
    if (
      fieldName !== "left" &&
      fieldName !== "right" &&
      fieldName !== "leftContent" &&
      fieldName !== "rightContent"
    ) {
      return;
    }

    setDesignerState((currentState) => ({
      ...currentState,
      matchFollowing: {
        ...currentState.matchFollowing,
        pairs: currentState.matchFollowing.pairs.map((pair) => {
          if (pair.id !== pairId) {
            return pair;
          }

          if (fieldName === "leftContent") {
            return {
              ...pair,
              left: getRichTextPlainText(value),
              leftContent: value,
            };
          }

          if (fieldName === "rightContent") {
            return {
              ...pair,
              right: getRichTextPlainText(value),
              rightContent: value,
            };
          }

          return { ...pair, [fieldName]: value };
        }),
      },
    }));
  }, []);

  const removeMatchFollowingPair = useCallback((pairId) => {
    setDesignerState((currentState) => {
      if (
        currentState.matchFollowing.pairs.length <= MIN_MATCH_FOLLOWING_PAIRS ||
        !currentState.matchFollowing.pairs.some((pair) => pair.id === pairId)
      ) {
        return currentState;
      }

      return {
        ...currentState,
        matchFollowing: {
          ...currentState.matchFollowing,
          pairs: currentState.matchFollowing.pairs.filter(
            (pair) => pair.id !== pairId,
          ),
        },
      };
    });
  }, []);

  const setCorrectTrueFalseAnswer = useCallback((correctAnswer) => {
    setDesignerState((currentState) => ({
      ...currentState,
      trueFalse: {
        ...currentState.trueFalse,
        correctAnswer:
          correctAnswer === true || correctAnswer === false
            ? correctAnswer
            : null,
      },
    }));
  }, []);

  const updateShortAnswerContent = useCallback((fieldName, content) => {
    if (fieldName !== "questionContent" && fieldName !== "modelAnswer") {
      return;
    }

    setDesignerState((currentState) => ({
      ...currentState,
      shortAnswer: {
        ...currentState.shortAnswer,
        [fieldName]: content,
      },
    }));
  }, []);

  const updateLongAnswerContent = useCallback((fieldName, content) => {
    if (fieldName !== "questionContent" && fieldName !== "modelAnswer") {
      return;
    }

    setDesignerState((currentState) => ({
      ...currentState,
      longAnswer: {
        ...currentState.longAnswer,
        [fieldName]: content,
      },
    }));
  }, []);

  const updateLongAnswerSuggestedWordCount = useCallback((value) => {
    setDesignerState((currentState) => ({
      ...currentState,
      longAnswer: {
        ...currentState.longAnswer,
        suggestedWordCount: String(value ?? "").trim() ? value : null,
      },
    }));
  }, []);

  const addFillBlankAcceptedAnswer = useCallback((blankId) => {
    setDesignerState((currentState) => ({
      ...currentState,
      fillBlanks: {
        ...currentState.fillBlanks,
        blanks: currentState.fillBlanks.blanks.map((blank) =>
          blank.id === blankId
            ? {
                ...blank,
                acceptedAnswers: [
                  ...(blank.acceptedAnswers?.length
                    ? blank.acceptedAnswers
                    : [""]),
                  "",
                ],
              }
            : blank,
        ),
      },
    }));
  }, []);

  const updateFillBlankAcceptedAnswer = useCallback(
    (blankId, answerIndex, value) => {
      setDesignerState((currentState) => ({
        ...currentState,
        fillBlanks: {
          ...currentState.fillBlanks,
          blanks: currentState.fillBlanks.blanks.map((blank) =>
            blank.id === blankId
              ? {
                  ...blank,
                  acceptedAnswers: (blank.acceptedAnswers?.length
                    ? blank.acceptedAnswers
                    : [""]
                  ).map((answer, index) =>
                    index === answerIndex ? value : answer,
                  ),
                }
              : blank,
          ),
        },
      }));
    },
    [],
  );

  const removeFillBlankAcceptedAnswer = useCallback((blankId, answerIndex) => {
    setDesignerState((currentState) => ({
      ...currentState,
      fillBlanks: {
        ...currentState.fillBlanks,
        blanks: currentState.fillBlanks.blanks.map((blank) => {
          if (blank.id !== blankId) {
            return blank;
          }

          const acceptedAnswers = blank.acceptedAnswers?.length
            ? blank.acceptedAnswers
            : [""];

          if (acceptedAnswers.length <= 1) {
            return blank;
          }

          return {
            ...blank,
            acceptedAnswers: acceptedAnswers.filter(
              (_answer, index) => index !== answerIndex,
            ),
          };
        }),
      },
    }));
  }, []);

  const goToStep = useCallback((step) => {
    setDesignerState((currentState) => ({
      ...currentState,
      currentStep: step,
    }));
  }, []);

  const goToPreviousStep = useCallback(() => {
    setDesignerState((currentState) => ({
      ...currentState,
      currentStep: Math.max(currentState.currentStep - 1, 1),
    }));
  }, []);

  const continueToNextStep = useCallback(() => {
    setDesignerState((currentState) => {
      const shouldStayOnCurrentStep =
        (currentState.currentStep === 1 && !currentState.questionType) ||
        (currentState.currentStep === 2 &&
          !isQuestionDetailsValid(currentState)) ||
        (currentState.currentStep === 3 &&
          !isQuestionTypeEditorValid(currentState));
      const nextStep = shouldStayOnCurrentStep
        ? currentState.currentStep
        : Math.min(currentState.currentStep + 1, 4);
      const shouldSyncFillBlanks =
        !shouldStayOnCurrentStep &&
        currentState.currentStep === 2 &&
        currentState.questionType === QUESTION_TYPES.FILL_BLANKS;

      return {
        ...currentState,
        currentStep: nextStep,
        fillBlanks: shouldSyncFillBlanks
          ? syncBlankAnswers(currentState.fillBlanks, currentState.prompt)
          : currentState.fillBlanks,
      };
    });
  }, []);

  const questionDetailsErrors = useMemo(
    () => validateQuestionDetails(designerState),
    [designerState],
  );
  const questionTypeEditorErrors = useMemo(
    () => validateQuestionTypeEditor(designerState),
    [designerState],
  );

  const canContinue =
    designerState.currentStep === 1
      ? Boolean(designerState.questionType)
      : designerState.currentStep === 2
        ? Object.keys(questionDetailsErrors).length === 0
        : designerState.currentStep === 3
          ? !hasQuestionTypeEditorValidationErrors(questionTypeEditorErrors)
          : false;

  const questionTypeEditorActions = useMemo(
    () => ({
      addFillBlankAcceptedAnswer,
      addMatchFollowingPair,
      addMultipleChoiceOption,
      removeMatchFollowingPair,
      removeMultipleChoiceOption,
      removeFillBlankAcceptedAnswer,
      removeQuestionImage,
      setCorrectMultipleChoiceOption,
      setCorrectTrueFalseAnswer,
      setQuestionImage,
      setQuestionImageError,
      updateFillBlankAcceptedAnswer,
      updateLongAnswerContent,
      updateLongAnswerSuggestedWordCount,
      updateMatchFollowingPair,
      updateMultipleChoiceOption,
      updateShortAnswerContent,
    }),
    [
      addFillBlankAcceptedAnswer,
      addMatchFollowingPair,
      addMultipleChoiceOption,
      removeMatchFollowingPair,
      removeMultipleChoiceOption,
      removeFillBlankAcceptedAnswer,
      removeQuestionImage,
      setCorrectMultipleChoiceOption,
      setCorrectTrueFalseAnswer,
      setQuestionImage,
      setQuestionImageError,
      updateFillBlankAcceptedAnswer,
      updateLongAnswerContent,
      updateLongAnswerSuggestedWordCount,
      updateMatchFollowingPair,
      updateMultipleChoiceOption,
      updateShortAnswerContent,
    ],
  );

  return {
    canContinue,
    continueToNextStep,
    designerState,
    goToStep,
    goToPreviousStep,
    questionDetailsErrors,
    questionTypeEditorActions,
    questionTypeEditorErrors,
    resetDesigner,
    selectQuestionType,
    setAssignedClass,
    setAssignedSubject,
    updateQuestionDetail,
  };
}
