import { DIFFICULTY_LEVELS } from "../constants/difficultyLevels.js";
import { usesSharedPromptField } from "../constants/questionTypes.js";

const MIN_MARKS = 1;
const MAX_TOPIC_NAME_LENGTH = 100;
const VALID_DIFFICULTIES = new Set(Object.values(DIFFICULTY_LEVELS));

function hasValue(value) {
  return String(value ?? "").trim().length > 0;
}

function isWholeNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && Number.isInteger(numericValue);
}

export function validateQuestionDetails(details) {
  const errors = {};

  if (!details.classId) {
    errors.classId = "Choose an assigned class.";
  }

  if (!details.subjectId) {
    errors.subjectId = "Choose an assigned subject.";
  }

  const topicName = String(details.topicName ?? "").trim();

  if (!topicName) {
    errors.topicName = "Enter a topic name.";
  } else if (topicName.length > MAX_TOPIC_NAME_LENGTH) {
    errors.topicName = `Topic name must be ${MAX_TOPIC_NAME_LENGTH} characters or fewer.`;
  }

  if (usesSharedPromptField(details.questionType) && !hasValue(details.prompt)) {
    errors.prompt = "Enter the question text or prompt.";
  }

  if (!hasValue(details.marks)) {
    errors.marks = "Enter marks for this question.";
  } else if (!isWholeNumber(details.marks)) {
    errors.marks = "Marks must be a whole number.";
  } else if (Number(details.marks) < MIN_MARKS) {
    errors.marks = `Marks must be at least ${MIN_MARKS}.`;
  }

  if (!VALID_DIFFICULTIES.has(details.difficulty)) {
    errors.difficulty = "Choose a difficulty level.";
  }

  return errors;
}

export function isQuestionDetailsValid(details) {
  return Object.keys(validateQuestionDetails(details)).length === 0;
}
