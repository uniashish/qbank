import {
  extractQuestionBlocksFromDocument,
  renumberQuestionBlocks,
} from "../nodes/questionBlockUtils.js";
import { calculateQuestionPaperSummary } from "./questionPaperSummary.js";

export const EMPTY_QUESTION_PAPER_DOCUMENT = {
  content: [{ type: "paragraph" }],
  type: "doc",
};

const SETUP_FIELD_NAMES = [
  "title",
  "classId",
  "subjectId",
  "examName",
  "term",
  "academicYear",
  "durationMinutes",
  "maximumMarks",
];

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

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeOptionalPositiveInteger(value) {
  if (value == null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isSafeInteger(numericValue) && numericValue > 0
    ? numericValue
    : null;
}

function normalizeDocumentContent(documentContent) {
  const clonedDocument = cloneJson(
    documentContent,
    EMPTY_QUESTION_PAPER_DOCUMENT,
  );

  if (clonedDocument?.type !== "doc" || !Array.isArray(clonedDocument.content)) {
    return EMPTY_QUESTION_PAPER_DOCUMENT;
  }

  return clonedDocument;
}

function normalizeQuestionBlock(questionBlock) {
  return {
    blockId: normalizeText(questionBlock?.blockId),
    difficulty: normalizeText(questionBlock?.difficulty) || "medium",
    marks: normalizeOptionalPositiveInteger(questionBlock?.marks) ?? 1,
    questionId: normalizeText(questionBlock?.questionId),
    questionNumber: normalizeText(questionBlock?.questionNumber),
    questionType: normalizeText(questionBlock?.questionType),
    snapshot: cloneJson(questionBlock?.snapshot, null),
  };
}

function resolveClassName(classId, assignmentState = {}) {
  return (
    assignmentState.classOptions?.find((classOption) => classOption.id === classId)
      ?.label ?? ""
  );
}

function resolveSubjectName(classId, subjectId, assignmentState = {}) {
  return (
    assignmentState
      .getSubjectsForClass?.(classId)
      ?.find((subject) => subject.id === subjectId)?.name ?? ""
  );
}

export function createQuestionPaperOwner(userProfile) {
  return {
    email: String(userProfile?.email ?? ""),
    name: String(userProfile?.name ?? ""),
    uid: String(userProfile?.uid ?? ""),
  };
}

export function createQuestionPaperSetupFields(setup = {}) {
  return {
    academicYear: normalizeText(setup.academicYear),
    classId: normalizeText(setup.classId),
    durationMinutes: normalizeOptionalPositiveInteger(setup.durationMinutes),
    examName: normalizeText(setup.examName),
    maximumMarks: normalizeOptionalPositiveInteger(setup.maximumMarks),
    subjectId: normalizeText(setup.subjectId),
    term: normalizeText(setup.term),
    title: normalizeText(setup.title),
  };
}

export function createQuestionPaperSetupFromDraft(paper, assignmentState = {}) {
  const setup = createQuestionPaperSetupFields(paper);

  return {
    ...setup,
    className: resolveClassName(setup.classId, assignmentState),
    subjectName: resolveSubjectName(
      setup.classId,
      setup.subjectId,
      assignmentState,
    ),
  };
}

export function createQuestionPaperDraftFields(designerState) {
  const setup = createQuestionPaperSetupFields(designerState?.setup);
  const renumberedResult = renumberQuestionBlocks(
    normalizeDocumentContent(designerState?.documentContent),
  );
  const questions = renumberedResult.questionBlocks.map(normalizeQuestionBlock);
  const summary = calculateQuestionPaperSummary({
    questionBlocks: questions,
    setup,
    status: "draft",
  });

  return {
    ...setup,
    difficultySummary: cloneJson(summary.difficulty, null),
    documentContent: renumberedResult.documentContent,
    questions,
    status: "draft",
    totalMarks: summary.totalMarks,
    totalQuestions: summary.questionCount,
  };
}

export function createQuestionPaperFinalFields(designerState) {
  return {
    ...createQuestionPaperDraftFields(designerState),
    status: "final",
  };
}

export function createQuestionPaperDraftDocument({
  designerState,
  userProfile,
}) {
  return {
    ...createQuestionPaperDraftFields(designerState),
    createdBy: createQuestionPaperOwner(userProfile),
  };
}

export function createQuestionPaperDraftFingerprint(designerState) {
  return JSON.stringify(createQuestionPaperDraftFields(designerState));
}

export function createQuestionPaperDesignerStateFromDraft({
  assignmentState,
  paper,
}) {
  const documentContent = normalizeDocumentContent(paper?.documentContent);
  const renumberedResult = renumberQuestionBlocks(documentContent);
  const questionBlocks = renumberedResult.questionBlocks.length
    ? renumberedResult.questionBlocks
    : extractQuestionBlocksFromDocument(documentContent);

  return {
    documentContent: renumberedResult.documentContent,
    questions: questionBlocks.map(normalizeQuestionBlock),
    setup: createQuestionPaperSetupFromDraft(paper, assignmentState),
    status: paper?.status === "final" ? "final" : "draft",
  };
}

export function getQuestionPaperMutableFieldNames() {
  return [
    ...SETUP_FIELD_NAMES,
    "documentContent",
    "questions",
    "totalQuestions",
    "totalMarks",
    "difficultySummary",
    "status",
  ];
}
