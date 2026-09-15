export function validateTrueFalse(trueFalse = {}) {
  if (
    trueFalse.correctAnswer === true ||
    trueFalse.correctAnswer === false
  ) {
    return {};
  }

  return {
    correctAnswer: "Choose True or False as the correct answer.",
  };
}

export function hasTrueFalseValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function isTrueFalseValid(trueFalse) {
  return !hasTrueFalseValidationErrors(validateTrueFalse(trueFalse));
}
