import { getOptionLabel } from "../../../question-designer/constants/optionLabels.js";
import {
  getQuestionTypeOption,
  QUESTION_TYPES,
} from "../../../question-designer/constants/questionTypes.js";
import { createMatchDisplayModel } from "../../../question-designer/utils/matchPairHelpers.js";
import {
  hasMeaningfulRichTextContent,
  normalizeRichTextContent,
} from "../../../question-designer/utils/richTextContent.js";
import {
  generateAnswerKeyModel,
  normalizeAnswerKeyOptions,
} from "../../answer-key/answerKeyGenerator.js";
import { extractQuestionBlocksFromDocument } from "../../nodes/questionBlockUtils.js";
import {
  createPlainTextBlocks,
  getRichTextNodeText,
  normalizeRichTextBlocks,
  normalizeRichTextImage,
} from "./rich-content/richTextPdfUtils.js";

const DEFAULT_TITLE = "Untitled Paper";
const BLANK_MARKER_PATTERN = /\[blank\]/gi;
const FILENAME_UNSAFE_CHARS = new Set(["<", ">", ":", "\"", "/", "\\", "|", "?", "*"]);

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

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();

  return text || fallback;
}

function normalizeNumber(value, fallback = null) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : fallback;
}

function normalizePositiveNumber(value, fallback = 0) {
  const numericValue = normalizeNumber(value, fallback);

  return numericValue > 0 ? numericValue : fallback;
}

function createId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

export function sanitizeExportFilename(value, fallback = "Question Paper") {
  const filenameBase = normalizeText(value, fallback);
  const normalizedValue = Array.from(filenameBase)
    .map((character) =>
      character.charCodeAt(0) < 32 || FILENAME_UNSAFE_CHARS.has(character)
        ? " "
        : character,
    )
    .join("")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return (normalizedValue || fallback).slice(0, 120).trim() || fallback;
}

function getQuestionType(questionBlock) {
  return normalizeText(
    questionBlock?.questionType || questionBlock?.snapshot?.questionType,
  );
}

function getQuestionTypeLabel(questionType) {
  return getQuestionTypeOption(questionType)?.title || normalizeText(questionType);
}

function getDurationLabel(durationMinutes) {
  const minutes = normalizePositiveNumber(durationMinutes, 0);

  if (!minutes) {
    return "";
  }

  if (minutes % 60 === 0) {
    const hours = minutes / 60;

    return `${hours} hour${hours === 1 ? "" : "s"}`;
  }

  return `${minutes} minutes`;
}

function hasMarks(value) {
  return normalizePositiveNumber(value, 0) > 0;
}

function getMarksLabel(marks) {
  const normalizedMarks = normalizePositiveNumber(marks, 0);

  if (!normalizedMarks) {
    return "";
  }

  return `${normalizedMarks} mark${normalizedMarks === 1 ? "" : "s"}`;
}

function replaceTextInRichTextContent(content, replacer) {
  const normalizedContent = normalizeRichTextContent(content);

  function visitNode(node) {
    if (!node || typeof node !== "object") {
      return node;
    }

    if (node.type === "text") {
      return {
        ...node,
        text: replacer(String(node.text ?? "")),
      };
    }

    if (!Array.isArray(node.content)) {
      return node;
    }

    return {
      ...node,
      content: node.content.map(visitNode),
    };
  }

  return visitNode(normalizedContent);
}

function getRichQuestionBlocks(snapshot, fallbackPrompt) {
  const questionContent = snapshot?.answerData?.questionContent;

  if (hasMeaningfulRichTextContent(questionContent)) {
    return normalizeRichTextBlocks(questionContent);
  }

  if (hasMeaningfulRichTextContent(snapshot?.promptContent)) {
    return normalizeRichTextBlocks(snapshot.promptContent);
  }

  return createPlainTextBlocks(fallbackPrompt);
}

function getFillBlankQuestionBlocks(snapshot, fallbackPrompt) {
  if (hasMeaningfulRichTextContent(snapshot?.promptContent)) {
    return normalizeRichTextBlocks(
      replaceTextInRichTextContent(snapshot.promptContent, (text) =>
        text.replace(BLANK_MARKER_PATTERN, "________"),
      ),
    );
  }

  return createPlainTextBlocks(
    fallbackPrompt.replace(BLANK_MARKER_PATTERN, "________"),
  );
}

function normalizeMultipleChoiceOptions(answerData = {}) {
  const options = Array.isArray(answerData.options) ? answerData.options : [];

  return options
    .map((option, index) => ({
      id: normalizeText(option?.id) || createId("option", index),
      blocks: normalizeRichTextBlocks(
        normalizeRichTextContent(option?.content, option?.text),
      ),
      originalIndex: index,
      order: Number.isSafeInteger(option?.order) ? option.order : index,
      text: normalizeText(option?.text, "Option unavailable"),
    }))
    .sort((firstOption, secondOption) => {
      if (firstOption.order !== secondOption.order) {
        return firstOption.order - secondOption.order;
      }

      return firstOption.originalIndex - secondOption.originalIndex;
    })
    .map((option, index) => ({
      id: option.id,
      blocks: option.blocks.length
        ? option.blocks
        : createPlainTextBlocks(option.text),
      label: getOptionLabel(index),
      text: option.text,
    }));
}

function normalizeMatchColumns(answerData = {}) {
  const pairs = Array.isArray(answerData.pairs) ? answerData.pairs : [];
  const displayModel = createMatchDisplayModel(
    pairs,
    answerData.columnBDisplayOrder,
  );

  return {
    columnA: displayModel.leftPairs.map((pair, index) => ({
      id: pair.id || createId("left", index),
      label: String(index + 1),
      blocks: normalizeRichTextBlocks(
        normalizeRichTextContent(pair.leftContent, pair.left),
      ),
      text: normalizeText(pair.left, "Item unavailable"),
    })),
    columnB: displayModel.rightPairs.map((pair, index) => ({
      id: pair.id || createId("right", index),
      label: getOptionLabel(index),
      blocks: normalizeRichTextBlocks(
        normalizeRichTextContent(pair.rightContent, pair.right),
      ),
      text: normalizeText(pair.right, "Item unavailable"),
    })),
  };
}

function getRunTextLength(runs = []) {
  return runs.reduce((total, run) => total + String(run?.text ?? "").length, 0);
}

function getBlockWeight(block) {
  if (!block) {
    return 0;
  }

  if (block.type === "image") {
    return 8;
  }

  if (block.type === "table") {
    const rowCount = Array.isArray(block.rows) ? block.rows.length : 0;
    const columnCount = block.columnCount || 1;

    return rowCount * Math.max(columnCount, 2);
  }

  if (block.type === "list") {
    return Array.isArray(block.items)
      ? block.items.reduce(
          (total, item) => {
            const itemBlocks = Array.isArray(item.blocks) ? item.blocks : [];

            return total +
            itemBlocks.reduce(
              (itemTotal, itemBlock) => itemTotal + getBlockWeight(itemBlock),
              1,
            );
          },
          0,
        )
      : 0;
  }

  if (Array.isArray(block.runs)) {
    return Math.max(1, Math.ceil(getRunTextLength(block.runs) / 100));
  }

  return 1;
}

function shouldKeepQuestionTogether(question) {
  const promptBlocks = Array.isArray(question.promptBlocks)
    ? question.promptBlocks
    : [];

  if (
    question.image ||
    promptBlocks.some((block) => block.type === "image" || block.type === "table")
  ) {
    return false;
  }

  if (
    question.type === QUESTION_TYPES.MATCH_FOLLOWING ||
    question.type === QUESTION_TYPES.LONG_ANSWER
  ) {
    return false;
  }

  const promptWeight = promptBlocks.reduce(
    (total, block) => total + getBlockWeight(block),
    0,
  );
  const optionWeight = Array.isArray(question.options)
    ? Math.ceil(question.options.length / 2)
    : 0;

  return promptWeight + optionWeight <= 5;
}

function normalizeQuestionBlock(questionBlock, index) {
  const snapshot = cloneJson(questionBlock?.snapshot, {}) ?? {};
  const answerData = snapshot.answerData ?? {};
  const questionType = getQuestionType(questionBlock);
  const prompt = normalizeText(snapshot.prompt, "Question prompt unavailable.");
  const baseQuestion = {
    id:
      normalizeText(questionBlock?.blockId) ||
      normalizeText(questionBlock?.questionId) ||
      createId("question", index),
    image: normalizeRichTextImage(snapshot.image, "Question image"),
    instructions: normalizeText(snapshot.instructions),
    marks: normalizePositiveNumber(questionBlock?.marks, 0),
    marksLabel: getMarksLabel(questionBlock?.marks),
    number: normalizeText(questionBlock?.questionNumber, String(index + 1)),
    promptBlocks: createPlainTextBlocks(prompt),
    questionId: normalizeText(questionBlock?.questionId),
    type: questionType,
    typeLabel: getQuestionTypeLabel(questionType),
  };

  let normalizedQuestion;

  switch (questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getFillBlankQuestionBlocks(snapshot, prompt),
      };
      break;

    case QUESTION_TYPES.LONG_ANSWER:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getRichQuestionBlocks(snapshot, prompt),
        suggestedWordCount: normalizePositiveNumber(
          answerData.suggestedWordCount,
          0,
        ),
      };
      break;

    case QUESTION_TYPES.MATCH_FOLLOWING:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getRichQuestionBlocks(snapshot, prompt),
        matchColumns: normalizeMatchColumns(answerData),
      };
      break;

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getRichQuestionBlocks(snapshot, prompt),
        options: normalizeMultipleChoiceOptions(answerData),
      };
      break;

    case QUESTION_TYPES.SHORT_ANSWER:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getRichQuestionBlocks(snapshot, prompt),
      };
      break;

    case QUESTION_TYPES.TRUE_FALSE:
      normalizedQuestion = {
        ...baseQuestion,
        promptBlocks: getRichQuestionBlocks(snapshot, prompt),
      };
      break;

    default:
      normalizedQuestion = baseQuestion;
  }

  return {
    ...normalizedQuestion,
    keepTogether: shouldKeepQuestionTogether(normalizedQuestion),
  };
}

function isHeadingNode(node, expectedText) {
  return (
    node?.type === "heading" &&
    getRichTextNodeText(node).trim().toLowerCase() === expectedText
  );
}

function extractPaperInstructions(documentContent) {
  const topLevelNodes = Array.isArray(documentContent?.content)
    ? documentContent.content
    : [];
  const instructionNodes = [];
  let isCollecting = false;

  for (const node of topLevelNodes) {
    if (isHeadingNode(node, "instructions")) {
      isCollecting = true;
      continue;
    }

    if (!isCollecting) {
      continue;
    }

    if (node?.type === "questionBlock" || node?.type === "heading") {
      break;
    }

    instructionNodes.push(node);
  }

  return normalizeRichTextBlocks({
    content: instructionNodes,
    type: "doc",
  });
}

function getOrderedQuestionBlocks(paper = {}) {
  const documentBlocks = paper.documentContent
    ? extractQuestionBlocksFromDocument(paper.documentContent)
    : [];
  const fallbackBlocks = Array.isArray(paper.questions) ? paper.questions : [];
  const orderedBlocks = documentBlocks.length > 0 ? documentBlocks : fallbackBlocks;

  return orderedBlocks.map((questionBlock, index) => ({
    ...questionBlock,
    questionNumber: normalizeText(questionBlock?.questionNumber, String(index + 1)),
    snapshot: cloneJson(questionBlock?.snapshot, null),
  }));
}

function createDocumentItems(documentContent, questions) {
  const topLevelNodes = Array.isArray(documentContent?.content)
    ? documentContent.content
    : [];
  const items = [];
  let questionIndex = 0;

  topLevelNodes.forEach((node, index) => {
    if (node?.type === "questionBlock") {
      const question = questions[questionIndex];
      questionIndex += 1;

      if (question) {
        items.push({
          id: question.id,
          question,
          type: "question",
        });
      }

      return;
    }

    if (node?.type === "horizontalRule") {
      items.push({
        id: createId("divider", index),
        type: "divider",
      });
    }
  });

  return items;
}

function normalizeAnswerEntry(entry) {
  const answer = entry?.answer ?? {};

  switch (answer.kind) {
    case QUESTION_TYPES.FILL_BLANKS:
      return {
        ...entry,
        answer: {
          blanks: Array.isArray(answer.blanks)
            ? answer.blanks.map((blank) => ({
                acceptedAnswers: Array.isArray(blank.acceptedAnswers)
                  ? blank.acceptedAnswers.map((value) => normalizeText(value))
                  : [],
                blankNumber: blank.blankNumber,
                id: normalizeText(blank.id),
              }))
            : [],
          kind: answer.kind,
        },
      };

    case QUESTION_TYPES.LONG_ANSWER:
    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        ...entry,
        answer: {
          hasModelAnswer: Boolean(answer.hasModelAnswer),
          kind: answer.kind,
          modelAnswerBlocks: normalizeRichTextBlocks(answer.modelAnswer),
        },
      };

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return {
        ...entry,
        answer: {
          kind: answer.kind,
          mappings: Array.isArray(answer.mappings) ? answer.mappings : [],
        },
      };

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        ...entry,
        answer: {
          kind: answer.kind,
          optionBlocks: normalizeRichTextBlocks(answer.optionContent),
          optionLabel: normalizeText(answer.optionLabel),
          optionText: normalizeText(answer.optionText),
        },
      };

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        ...entry,
        answer: {
          kind: answer.kind,
          value: normalizeText(answer.value),
        },
      };

    default:
      return {
        ...entry,
        answer: {
          kind: "unsupported",
          message: normalizeText(
            answer.message,
            "Answer key rendering is not available for this question type.",
          ),
        },
      };
  }
}

function normalizeAnswerKey(answerKey) {
  const entries = Array.isArray(answerKey?.entries) ? answerKey.entries : [];

  return {
    entries: entries.map((entry, index) => ({
      ...normalizeAnswerEntry(entry),
      blockId: normalizeText(entry?.blockId, createId("answer", index)),
      questionNumber: normalizeText(entry?.questionNumber, String(index + 1)),
      questionType: normalizeText(entry?.questionType),
    })),
    totalQuestions: entries.length,
  };
}

function createMetaRows(paper) {
  return [
    ["Exam", normalizeText(paper.examName)],
    ["Class", normalizeText(paper.className || paper.class || paper.classId)],
    ["Subject", normalizeText(paper.subject || paper.subjectName || paper.subjectId)],
    ["Term", normalizeText(paper.term)],
    ["Academic Year", normalizeText(paper.academicYear)],
    ["Duration", getDurationLabel(paper.durationMinutes)],
    [
      "Maximum Marks",
      hasMarks(paper.maximumMarks) ? String(normalizePositiveNumber(paper.maximumMarks)) : "",
    ],
  ]
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => ({ label, value }));
}

export function buildPaperExportModel({
  answerKeyOptions,
  pageSize = "A4",
  paper,
} = {}) {
  const safePaper = paper ?? {};
  const title = normalizeText(safePaper.title, DEFAULT_TITLE);
  const orderedQuestionBlocks = getOrderedQuestionBlocks(safePaper);
  const questions = orderedQuestionBlocks.map(normalizeQuestionBlock);
  const answerKey = generateAnswerKeyModel({
    documentContent: safePaper.documentContent,
    questionBlocks: safePaper.questions,
  });

  return {
    answerKey: normalizeAnswerKey(answerKey),
    answerKeyOptions: normalizeAnswerKeyOptions(answerKeyOptions),
    filenameBase: sanitizeExportFilename(title),
    instructions: extractPaperInstructions(safePaper.documentContent),
    metaRows: createMetaRows(safePaper),
    documentItems: createDocumentItems(safePaper.documentContent, questions),
    pageSize,
    paperId: normalizeText(safePaper.id),
    questions,
    status: normalizeText(safePaper.status),
    summary: {
      maximumMarks: normalizePositiveNumber(
        safePaper.maximumMarks ?? safePaper.totalMarks,
        0,
      ),
      totalMarks: normalizePositiveNumber(safePaper.totalMarks, 0),
      totalQuestions:
        normalizePositiveNumber(safePaper.totalQuestions, 0) ||
        orderedQuestionBlocks.length,
    },
    title,
  };
}
