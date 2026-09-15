export const MIN_MULTIPLE_CHOICE_OPTIONS = 2;
export const MAX_MULTIPLE_CHOICE_OPTIONS = 8;

function normalizeOptionText(text) {
  return String(text ?? "").trim().toLowerCase();
}

export function validateMultipleChoice(multipleChoice = {}, questionImage = {}) {
  const options = multipleChoice.options ?? [];
  const errors = {
    optionTexts: {},
  };

  if (options.length < MIN_MULTIPLE_CHOICE_OPTIONS) {
    errors.options = `Add at least ${MIN_MULTIPLE_CHOICE_OPTIONS} answer options.`;
  } else if (options.length > MAX_MULTIPLE_CHOICE_OPTIONS) {
    errors.options = `Use no more than ${MAX_MULTIPLE_CHOICE_OPTIONS} answer options.`;
  }

  const optionIds = new Set(options.map((option) => option.id));
  const normalizedOptionCounts = new Map();

  options.forEach((option) => {
    const normalizedText = normalizeOptionText(option.text);

    if (!normalizedText) {
      errors.optionTexts[option.id] = "Enter option text.";
      return;
    }

    normalizedOptionCounts.set(
      normalizedText,
      (normalizedOptionCounts.get(normalizedText) ?? 0) + 1,
    );
  });

  options.forEach((option) => {
    const normalizedText = normalizeOptionText(option.text);

    if (
      normalizedText &&
      normalizedOptionCounts.get(normalizedText) > 1
    ) {
      errors.optionTexts[option.id] = "Option text must be unique.";
    }
  });

  if (
    !multipleChoice.correctOptionId ||
    !optionIds.has(multipleChoice.correctOptionId)
  ) {
    errors.correctOptionId = "Choose one correct answer.";
  }

  if (questionImage.error) {
    errors.image = questionImage.error;
  }

  if (Object.keys(errors.optionTexts).length === 0) {
    delete errors.optionTexts;
  }

  return errors;
}

export function hasMultipleChoiceValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function isMultipleChoiceValid(multipleChoice, questionImage) {
  return !hasMultipleChoiceValidationErrors(
    validateMultipleChoice(multipleChoice, questionImage),
  );
}
