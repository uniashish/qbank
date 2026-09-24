import { getOptionLabel } from "../../question-designer/constants/optionLabels.js";
import { QUESTION_TYPES } from "../../question-designer/constants/questionTypes.js";
import { createMatchDisplayModel } from "../../question-designer/utils/matchPairHelpers.js";
import {
  cloneRichTextContent,
  hasMeaningfulRichTextContent,
  normalizeRichTextContent,
} from "../../question-designer/utils/richTextContent.js";
import { extractQuestionBlocksFromDocument } from "../nodes/questionBlockUtils.js";

export const ANSWER_KEY_MODES = {
  APPEND: "append",
  NONE: "none",
  SEPARATE: "separate",
};

export const DEFAULT_ANSWER_KEY_OPTIONS = {
  mode: ANSWER_KEY_MODES.NONE,
};

const ANSWER_KEY_MODE_VALUES = new Set(Object.values(ANSWER_KEY_MODES));

function normalizeText(value) {
  return String(value ?? "").trim();
}

function cloneJson(value, fallback = null) {
  if (value == null) {
    return fallback;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function getQuestionType(questionBlock) {
  return normalizeText(
    questionBlock?.questionType || questionBlock?.snapshot?.questionType,
  );
}

export function normalizeAnswerKeyOptions(options = {}) {
  const mode = normalizeText(options.mode);

  return {
    mode: ANSWER_KEY_MODE_VALUES.has(mode) ? mode : ANSWER_KEY_MODES.NONE,
  };
}

export function extractOrderedQuestionBlocks({
  documentContent,
  questionBlocks,
} = {}) {
  const documentBlocks = documentContent
    ? extractQuestionBlocksFromDocument(documentContent)
    : [];
  const fallbackBlocks = Array.isArray(questionBlocks) ? questionBlocks : [];
  const orderedBlocks = documentBlocks.length > 0 ? documentBlocks : fallbackBlocks;

  return orderedBlocks.map((questionBlock, index) => ({
    ...questionBlock,
    questionNumber: normalizeText(questionBlock?.questionNumber) || String(index + 1),
    snapshot: cloneJson(questionBlock?.snapshot, null),
  }));
}

export function normalizeMultipleChoiceAnswer(answerData = {}) {
  const options = Array.isArray(answerData.options) ? answerData.options : [];
  const correctOptionIndex = options.findIndex(
    (option) => option?.id === answerData.correctOptionId,
  );
  const correctOption =
    correctOptionIndex >= 0 ? options[correctOptionIndex] : null;

  return {
    kind: QUESTION_TYPES.MULTIPLE_CHOICE,
    optionContent: correctOption
      ? normalizeRichTextContent(correctOption.content, correctOption.text)
      : null,
    optionLabel:
      correctOptionIndex >= 0 ? getOptionLabel(correctOptionIndex) : "",
    optionText: normalizeText(correctOption?.text),
  };
}

export function normalizeTrueFalseAnswer(answerData = {}) {
  return {
    kind: QUESTION_TYPES.TRUE_FALSE,
    value:
      answerData.correctAnswer === true
        ? "True"
        : answerData.correctAnswer === false
          ? "False"
          : "",
  };
}

export function normalizeFillBlanksAnswer(answerData = {}) {
  const blanks = Array.isArray(answerData.blanks) ? answerData.blanks : [];

  return {
    blanks: blanks.map((blank, index) => ({
      acceptedAnswers: Array.isArray(blank?.acceptedAnswers)
        ? blank.acceptedAnswers.map(normalizeText).filter(Boolean)
        : [],
      blankNumber: index + 1,
      id: normalizeText(blank?.id) || `blank-${index + 1}`,
    })),
    kind: QUESTION_TYPES.FILL_BLANKS,
  };
}

export function normalizeMatchFollowingAnswer(answerData = {}) {
  const pairs = Array.isArray(answerData.pairs) ? answerData.pairs : [];
  const displayModel = createMatchDisplayModel(
    pairs,
    answerData.columnBDisplayOrder,
  );

  return {
    kind: QUESTION_TYPES.MATCH_FOLLOWING,
    mappings: displayModel.mappings.map((mapping) => ({
      leftIndex: mapping.leftIndex,
      leftLabel: String(mapping.leftIndex + 1),
      pairId: mapping.pairId,
      rightIndex: mapping.rightIndex,
      rightLabel:
        Number.isInteger(mapping.rightIndex)
          ? getOptionLabel(mapping.rightIndex)
          : "",
    })),
  };
}

export function normalizeRichAnswer(answerData = {}, kind) {
  const modelAnswer = cloneRichTextContent(answerData.modelAnswer);

  return {
    kind,
    modelAnswer,
    hasModelAnswer: hasMeaningfulRichTextContent(modelAnswer),
  };
}

function normalizeUnsupportedAnswer(questionType) {
  return {
    kind: "unsupported",
    message: questionType
      ? `Answer key rendering is not available for ${questionType}.`
      : "Answer key rendering is not available for this question type.",
  };
}

export function normalizeAnswerKeyEntry(questionBlock, index) {
  const answerData = questionBlock?.snapshot?.answerData ?? {};
  const questionType = getQuestionType(questionBlock);
  let answer;

  switch (questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      answer = normalizeFillBlanksAnswer(answerData);
      break;

    case QUESTION_TYPES.LONG_ANSWER:
      answer = normalizeRichAnswer(answerData, QUESTION_TYPES.LONG_ANSWER);
      break;

    case QUESTION_TYPES.MATCH_FOLLOWING:
      answer = normalizeMatchFollowingAnswer(answerData);
      break;

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      answer = normalizeMultipleChoiceAnswer(answerData);
      break;

    case QUESTION_TYPES.SHORT_ANSWER:
      answer = normalizeRichAnswer(answerData, QUESTION_TYPES.SHORT_ANSWER);
      break;

    case QUESTION_TYPES.TRUE_FALSE:
      answer = normalizeTrueFalseAnswer(answerData);
      break;

    default:
      answer = normalizeUnsupportedAnswer(questionType);
  }

  return {
    answer,
    blockId: normalizeText(questionBlock?.blockId) || `question-${index + 1}`,
    questionId: normalizeText(questionBlock?.questionId),
    questionNumber: normalizeText(questionBlock?.questionNumber) || String(index + 1),
    questionType,
  };
}

export function generateAnswerKeyModel({
  documentContent,
  questionBlocks,
} = {}) {
  const orderedQuestionBlocks = extractOrderedQuestionBlocks({
    documentContent,
    questionBlocks,
  });

  return {
    entries: orderedQuestionBlocks.map(normalizeAnswerKeyEntry),
    totalQuestions: orderedQuestionBlocks.length,
  };
}
