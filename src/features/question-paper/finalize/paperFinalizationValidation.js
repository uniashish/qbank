import { QUESTION_TYPES } from "../../question-designer/constants/questionTypes.js";

const VALID_QUESTION_TYPES = new Set(Object.values(QUESTION_TYPES));

function hasText(value) {
  return String(value ?? "").trim().length > 0;
}

function isPositiveWholeNumber(value) {
  const numericValue = Number(value);

  return (
    Number.isSafeInteger(numericValue) &&
    numericValue > 0 &&
    String(value ?? "").trim() !== ""
  );
}

function normalizePositiveNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
}

function getQuestionBlockLabel(questionBlock, index) {
  return `Question ${questionBlock?.questionNumber || index + 1}`;
}

function validateQuestionBlock(questionBlock, index) {
  const errors = [];
  const label = getQuestionBlockLabel(questionBlock, index);
  const snapshot = questionBlock?.snapshot;
  const questionType = questionBlock?.questionType || snapshot?.questionType;

  if (!hasText(questionBlock?.blockId)) {
    errors.push(`${label} is missing its paper block reference.`);
  }

  if (!hasText(questionBlock?.questionId)) {
    errors.push(`${label} is missing its source question reference.`);
  }

  if (!hasText(questionBlock?.questionNumber)) {
    errors.push(`${label} is missing its question number.`);
  }

  if (!isPositiveWholeNumber(questionBlock?.marks)) {
    errors.push(`${label} must have marks greater than zero.`);
  }

  if (!VALID_QUESTION_TYPES.has(questionType)) {
    errors.push(`${label} has an unsupported question type.`);
  }

  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    errors.push(`${label} is missing its saved question snapshot.`);
    return errors;
  }

  if (!hasText(snapshot.prompt)) {
    errors.push(`${label} is missing question text in its saved snapshot.`);
  }

  if (!snapshot.answerData || typeof snapshot.answerData !== "object") {
    errors.push(`${label} is missing answer data in its saved snapshot.`);
  }

  return errors;
}

export function validatePaperFinalization({
  designerState,
  paperId,
  summary,
} = {}) {
  const errors = [];
  const warnings = [];
  const setup = designerState?.setup ?? {};
  const questions = Array.isArray(designerState?.questions)
    ? designerState.questions
    : [];
  const totalMarks = normalizePositiveNumber(summary?.totalMarks);
  const maximumMarks = normalizePositiveNumber(setup.maximumMarks);

  if (!paperId) {
    errors.push("Save the paper before finalizing it.");
  }

  if (!designerState) {
    errors.push("Paper content could not be loaded.");
  } else if (designerState.status !== "draft") {
    errors.push("Only draft papers can be finalized.");
  }

  if (!hasText(setup.title)) {
    errors.push("Enter a paper title.");
  }

  if (!hasText(setup.classId)) {
    errors.push("Choose a class.");
  }

  if (!hasText(setup.subjectId)) {
    errors.push("Choose a subject.");
  }

  if (questions.length < 1) {
    errors.push("Add at least one question.");
  }

  if (totalMarks <= 0) {
    errors.push("Total marks must be greater than zero.");
  }

  questions.forEach((questionBlock, index) => {
    errors.push(...validateQuestionBlock(questionBlock, index));
  });

  if (maximumMarks > 0 && totalMarks !== maximumMarks) {
    warnings.push(
      `Total marks (${totalMarks}) do not match maximum marks (${maximumMarks}).`,
    );
  }

  return {
    canFinalize: errors.length === 0,
    errors,
    warnings,
  };
}
