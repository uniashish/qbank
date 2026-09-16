import { hasMeaningfulRichTextContent } from "../../utils/richTextContent.js";

function hasSuggestedWordCount(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function isValidSuggestedWordCount(value) {
  if (!hasSuggestedWordCount(value)) {
    return true;
  }

  const numericValue = Number(value);

  return (
    Number.isFinite(numericValue) &&
    Number.isInteger(numericValue) &&
    numericValue > 0
  );
}

export function normalizeSuggestedWordCount(value) {
  return hasSuggestedWordCount(value) ? Number(value) : null;
}

export function validateLongAnswer(longAnswer = {}) {
  const errors = {};

  if (!hasMeaningfulRichTextContent(longAnswer.questionContent)) {
    errors.questionContent = "Enter the question content.";
  }

  if (!hasMeaningfulRichTextContent(longAnswer.modelAnswer)) {
    errors.modelAnswer = "Enter the model answer or marking guide.";
  }

  if (!isValidSuggestedWordCount(longAnswer.suggestedWordCount)) {
    errors.suggestedWordCount =
      "Suggested word count must be a positive whole number.";
  }

  return errors;
}

export function hasLongAnswerValidationErrors(errors = {}) {
  return Boolean(
    errors.questionContent || errors.modelAnswer || errors.suggestedWordCount,
  );
}
