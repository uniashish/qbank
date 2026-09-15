import {
  countBlankMarkers,
  MAX_FILL_BLANK_ACCEPTED_ANSWERS,
  MAX_FILL_BLANKS,
} from "./fillBlanksUtils.js";

function normalizeAnswer(answer) {
  return String(answer ?? "").trim().toLowerCase();
}

export function validateFillBlanks(
  fillBlanks = {},
  prompt = "",
  questionImage = {},
) {
  const markerCount = countBlankMarkers(prompt);
  const blanks = Array.isArray(fillBlanks.blanks) ? fillBlanks.blanks : [];
  const errors = {
    blankAnswers: {},
  };

  if (markerCount === 0) {
    errors.markerCount =
      "Add at least one [blank] marker to the question prompt before defining answers.";
  } else if (markerCount > MAX_FILL_BLANKS) {
    errors.markerCount = `Use no more than ${MAX_FILL_BLANKS} [blank] markers in the question prompt.`;
  }

  if (markerCount > 0 && blanks.length !== Math.min(markerCount, MAX_FILL_BLANKS)) {
    errors.blanks = "Blank answer groups must match the [blank] markers in the prompt.";
  }

  blanks.forEach((blank, blankIndex) => {
    const acceptedAnswers = Array.isArray(blank.acceptedAnswers)
      ? blank.acceptedAnswers
      : [];
    const blankId = blank.id || `blank-${blankIndex + 1}`;
    const answerErrors = {};
    const normalizedAnswerCounts = new Map();

    if (acceptedAnswers.length === 0) {
      errors.blankAnswers[blankId] = {
        answers: "Add at least one accepted answer.",
      };
      return;
    }

    if (acceptedAnswers.length > MAX_FILL_BLANK_ACCEPTED_ANSWERS) {
      errors.blankAnswers[blankId] = {
        answers: `Use no more than ${MAX_FILL_BLANK_ACCEPTED_ANSWERS} accepted answers for one blank.`,
      };
      return;
    }

    acceptedAnswers.forEach((answer) => {
      const normalizedAnswer = normalizeAnswer(answer);

      if (!normalizedAnswer) {
        return;
      }

      normalizedAnswerCounts.set(
        normalizedAnswer,
        (normalizedAnswerCounts.get(normalizedAnswer) ?? 0) + 1,
      );
    });

    acceptedAnswers.forEach((answer, answerIndex) => {
      const normalizedAnswer = normalizeAnswer(answer);

      if (!normalizedAnswer) {
        answerErrors[answerIndex] = "Enter an accepted answer.";
        return;
      }

      if (normalizedAnswerCounts.get(normalizedAnswer) > 1) {
        answerErrors[answerIndex] =
          "Accepted answers for the same blank must be unique.";
      }
    });

    if (Object.keys(answerErrors).length > 0) {
      errors.blankAnswers[blankId] = {
        acceptedAnswers: answerErrors,
      };
    }
  });

  if (questionImage.error) {
    errors.image = questionImage.error;
  }

  if (Object.keys(errors.blankAnswers).length === 0) {
    delete errors.blankAnswers;
  }

  return errors;
}

export function hasFillBlanksValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function isFillBlanksValid(fillBlanks, prompt, questionImage) {
  return !hasFillBlanksValidationErrors(
    validateFillBlanks(fillBlanks, prompt, questionImage),
  );
}
