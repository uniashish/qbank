import { QUESTION_TYPES } from "../constants/questionTypes.js";
import {
  hasFillBlanksValidationErrors,
  validateFillBlanks,
} from "./fill-blanks/fillBlanksValidation.js";
import {
  hasMultipleChoiceValidationErrors,
  validateMultipleChoice,
} from "./multiple-choice/multipleChoiceValidation.js";
import {
  hasShortAnswerValidationErrors,
  validateShortAnswer,
} from "./short-answer/shortAnswerValidation.js";
import {
  hasTrueFalseValidationErrors,
  validateTrueFalse,
} from "./true-false/trueFalseValidation.js";

export function validateQuestionTypeEditor(designerState) {
  switch (designerState.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return {
        fillBlanks: validateFillBlanks(
          designerState.fillBlanks,
          designerState.prompt,
          designerState.questionImage,
        ),
      };

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        multipleChoice: validateMultipleChoice(
          designerState.multipleChoice,
          designerState.questionImage,
        ),
      };

    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        shortAnswer: validateShortAnswer(designerState.shortAnswer),
      };

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        trueFalse: validateTrueFalse(designerState.trueFalse),
      };

    default:
      return {
        unsupported: "This question type editor is not available yet.",
      };
  }
}

export function hasQuestionTypeEditorValidationErrors(errors = {}) {
  if (errors.unsupported) {
    return true;
  }

  if (errors.fillBlanks) {
    return hasFillBlanksValidationErrors(errors.fillBlanks);
  }

  if (errors.multipleChoice) {
    return hasMultipleChoiceValidationErrors(errors.multipleChoice);
  }

  if (errors.shortAnswer) {
    return hasShortAnswerValidationErrors(errors.shortAnswer);
  }

  if (errors.trueFalse) {
    return hasTrueFalseValidationErrors(errors.trueFalse);
  }

  return false;
}

export function isQuestionTypeEditorValid(designerState) {
  return !hasQuestionTypeEditorValidationErrors(
    validateQuestionTypeEditor(designerState),
  );
}
