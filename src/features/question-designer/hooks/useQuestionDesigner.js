import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  hasQuestionTypeEditorValidationErrors,
  isQuestionTypeEditorValid,
  validateQuestionTypeEditor,
} from "../editors/questionTypeEditorValidation.js";
import { syncBlankAnswers } from "../editors/fill-blanks/fillBlanksUtils.js";
import {
  MAX_MULTIPLE_CHOICE_OPTIONS,
  MIN_MULTIPLE_CHOICE_OPTIONS,
} from "../editors/multiple-choice/multipleChoiceValidation.js";
import {
  isQuestionDetailsValid,
  validateQuestionDetails,
} from "../validation/questionDetailsValidation.js";
import { QUESTION_TYPES } from "../constants/questionTypes.js";

const INITIAL_MULTIPLE_CHOICE_OPTIONS = Array.from(
  { length: MIN_MULTIPLE_CHOICE_OPTIONS },
  (_, index) => ({
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
  questionType: null,
  subjectId: null,
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

function createInitialTrueFalseState() {
  return {
    correctAnswer: null,
  };
}

export function createInitialQuestionDesignerState(overrides = {}) {
  return {
    ...INITIAL_DESIGNER_STATE,
    fillBlanks: createInitialFillBlanksState(),
    multipleChoice: createInitialMultipleChoiceState(),
    questionImage: createInitialQuestionImageState(),
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
    question.prompt ?? "",
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
      id: option.id || `opt-${index + 1}`,
      text: option.text ?? "",
    })),
  };
}

function getTrueFalseState(question = {}) {
  const correctAnswer = question.answerData?.correctAnswer;

  return {
    correctAnswer:
      correctAnswer === true || correctAnswer === false ? correctAnswer : null,
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
    questionType === QUESTION_TYPES.MULTIPLE_CHOICE ||
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
    marks: question.marks ?? 1,
    mode,
    multipleChoice: getMultipleChoiceState(question),
    prompt: question.prompt ?? "",
    questionImage: getQuestionImageState(question),
    questionType: question.questionType ?? null,
    subjectId: question.subjectId ?? null,
    topicName: question.topicName ?? "",
    trueFalse: getTrueFalseState(question),
  });
}

export function useQuestionDesigner({ initialQuestion = null, mode = "create" } = {}) {
  const imagePreviewUrlRef = useRef(null);
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
      const nextState = {
        ...currentState,
        [fieldName]: value,
      };

      if (
        fieldName === "prompt" &&
        currentState.questionType === QUESTION_TYPES.FILL_BLANKS
      ) {
        nextState.fillBlanks = syncBlankAnswers(currentState.fillBlanks, value);
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

  const updateMultipleChoiceOption = useCallback((optionId, text) => {
    setDesignerState((currentState) => ({
      ...currentState,
      multipleChoice: {
        ...currentState.multipleChoice,
        options: currentState.multipleChoice.options.map((option) =>
          option.id === optionId ? { ...option, text } : option,
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
      addMultipleChoiceOption,
      removeMultipleChoiceOption,
      removeFillBlankAcceptedAnswer,
      removeQuestionImage,
      setCorrectMultipleChoiceOption,
      setCorrectTrueFalseAnswer,
      setQuestionImage,
      setQuestionImageError,
      updateFillBlankAcceptedAnswer,
      updateMultipleChoiceOption,
    }),
    [
      addFillBlankAcceptedAnswer,
      addMultipleChoiceOption,
      removeMultipleChoiceOption,
      removeFillBlankAcceptedAnswer,
      removeQuestionImage,
      setCorrectMultipleChoiceOption,
      setCorrectTrueFalseAnswer,
      setQuestionImage,
      setQuestionImageError,
      updateFillBlankAcceptedAnswer,
      updateMultipleChoiceOption,
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
