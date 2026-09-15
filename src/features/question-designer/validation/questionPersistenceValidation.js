import { DIFFICULTY_LEVELS } from "../constants/difficultyLevels.js";
import { QUESTION_TYPES } from "../constants/questionTypes.js";
import {
  hasFillBlanksValidationErrors,
  validateFillBlanks,
} from "../editors/fill-blanks/fillBlanksValidation.js";
import { validateTrueFalse } from "../editors/true-false/trueFalseValidation.js";

const MIN_MULTIPLE_CHOICE_OPTIONS = 2;
const MAX_MULTIPLE_CHOICE_OPTIONS = 8;
const VALID_DIFFICULTIES = new Set(Object.values(DIFFICULTY_LEVELS));
const VALID_PERSISTED_QUESTION_TYPES = new Set([
  QUESTION_TYPES.FILL_BLANKS,
  QUESTION_TYPES.MULTIPLE_CHOICE,
  QUESTION_TYPES.TRUE_FALSE,
]);

export const QUESTION_PERSISTENCE_ERROR_CODES = {
  INVALID_DRAFT: "INVALID_QUESTION_DRAFT",
  INVALID_TEACHER_PROFILE: "INVALID_TEACHER_PROFILE",
};

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function isPositiveWholeNumber(value) {
  const numericValue = Number(value);

  return (
    Number.isFinite(numericValue) &&
    Number.isInteger(numericValue) &&
    numericValue > 0
  );
}

function createQuestionPersistenceError(code, message, validationErrors = {}) {
  const error = new Error(message);
  error.code = code;
  error.validationErrors = validationErrors;

  return error;
}

function validateTeacherProfile(teacherProfile, errors) {
  if (!teacherProfile?.uid) {
    errors.teacherProfile = "Your teacher profile could not be verified.";
    return;
  }

  if (!teacherProfile.schoolId) {
    errors.teacherProfile = "Your teacher account is not linked to a school.";
  }

  if (!hasText(teacherProfile.name)) {
    errors.teacherName = "Your teacher profile is missing a name.";
  }

  if (!hasText(teacherProfile.email)) {
    errors.teacherEmail = "Your teacher profile is missing an email address.";
  }
}

function validateMultipleChoiceAnswerData(answerData, errors) {
  const options = Array.isArray(answerData?.options) ? answerData.options : [];
  const optionIds = new Set();

  if (
    options.length < MIN_MULTIPLE_CHOICE_OPTIONS ||
    options.length > MAX_MULTIPLE_CHOICE_OPTIONS
  ) {
    errors.answerData = `Multiple choice questions must have ${MIN_MULTIPLE_CHOICE_OPTIONS}-${MAX_MULTIPLE_CHOICE_OPTIONS} options.`;
    return;
  }

  options.forEach((option) => {
    if (!option?.id || !hasText(option.text)) {
      errors.answerData = "Every answer option must have text.";
      return;
    }

    optionIds.add(option.id);
  });

  if (!answerData?.correctOptionId || !optionIds.has(answerData.correctOptionId)) {
    errors.correctOptionId = "Choose one correct answer.";
  }
}

function validateFillBlanksAnswerData(answerData, prompt, errors) {
  const fillBlanksErrors = validateFillBlanks(answerData, prompt);

  if (!hasFillBlanksValidationErrors(fillBlanksErrors)) {
    return;
  }

  errors.answerData =
    fillBlanksErrors.markerCount ||
    fillBlanksErrors.blanks ||
    "Every blank must have at least one valid accepted answer.";
}

function validateTrueFalseAnswerData(answerData, errors) {
  const trueFalseErrors = validateTrueFalse(answerData);

  if (trueFalseErrors.correctAnswer) {
    errors.correctAnswer = trueFalseErrors.correctAnswer;
  }
}

export function validateQuestionPersistenceInput({ draft, teacherProfile }) {
  const errors = {};

  validateTeacherProfile(teacherProfile, errors);

  if (!draft) {
    errors.draft = "Question draft could not be prepared.";
    return errors;
  }

  if (!VALID_PERSISTED_QUESTION_TYPES.has(draft.questionType)) {
    errors.questionType = "This question type cannot be saved yet.";
  }

  if (!draft.classId) {
    errors.classId = "Choose an assigned class.";
  }

  if (!draft.subjectId) {
    errors.subjectId = "Choose an assigned subject.";
  }

  if (!hasText(draft.topicName)) {
    errors.topicName = "Enter a topic name.";
  }

  if (!hasText(draft.prompt)) {
    errors.prompt = "Enter the question text or prompt.";
  }

  if (!isPositiveWholeNumber(draft.marks)) {
    errors.marks = "Marks must be a whole number greater than zero.";
  }

  if (!VALID_DIFFICULTIES.has(draft.difficulty)) {
    errors.difficulty = "Choose a difficulty level.";
  }

  if (draft.questionImage?.error) {
    errors.questionImage = draft.questionImage.error;
  }

  if (draft.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    validateMultipleChoiceAnswerData(draft.answerData, errors);
  }

  if (draft.questionType === QUESTION_TYPES.FILL_BLANKS) {
    validateFillBlanksAnswerData(draft.answerData, draft.prompt, errors);
  }

  if (draft.questionType === QUESTION_TYPES.TRUE_FALSE) {
    validateTrueFalseAnswerData(draft.answerData, errors);
  }

  return errors;
}

export function assertQuestionCanBeSaved(input) {
  const validationErrors = validateQuestionPersistenceInput(input);

  if (Object.keys(validationErrors).length === 0) {
    return;
  }

  const hasTeacherProfileError = Boolean(
    validationErrors.teacherProfile ||
      validationErrors.teacherName ||
      validationErrors.teacherEmail,
  );

  throw createQuestionPersistenceError(
    hasTeacherProfileError
      ? QUESTION_PERSISTENCE_ERROR_CODES.INVALID_TEACHER_PROFILE
      : QUESTION_PERSISTENCE_ERROR_CODES.INVALID_DRAFT,
    Object.values(validationErrors)[0] || "Question could not be saved.",
    validationErrors,
  );
}
