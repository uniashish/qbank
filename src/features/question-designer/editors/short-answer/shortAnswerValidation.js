import { hasMeaningfulRichTextContent } from "../../utils/richTextContent.js";

export function validateShortAnswer(shortAnswer = {}) {
  const errors = {};

  if (!hasMeaningfulRichTextContent(shortAnswer.questionContent)) {
    errors.questionContent = "Enter the question content.";
  }

  if (!hasMeaningfulRichTextContent(shortAnswer.modelAnswer)) {
    errors.modelAnswer = "Enter the model answer.";
  }

  return errors;
}

export function hasShortAnswerValidationErrors(errors = {}) {
  return Boolean(errors.questionContent || errors.modelAnswer);
}
