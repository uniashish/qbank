import { getQuestionTypeOption } from "../../question-designer/constants/questionTypes.js";
import { calculateDifficultySummary } from "./questionPaperDifficulty.js";

function normalizeMarks(value) {
  const marks = Number(value);

  return Number.isFinite(marks) && marks > 0 ? marks : 0;
}

function normalizeText(value, fallback = "Not set") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function addMarksToCoverage(coverageMap, label, marks) {
  coverageMap.set(label, (coverageMap.get(label) ?? 0) + marks);
}

function mapCoverageToRows(coverageMap) {
  return [...coverageMap.entries()]
    .map(([label, marks]) => ({ label, marks }))
    .sort((first, second) => {
      if (second.marks !== first.marks) {
        return second.marks - first.marks;
      }

      return first.label.localeCompare(second.label);
    });
}

function getQuestionTypeLabel(questionBlock) {
  const questionType =
    questionBlock.questionType || questionBlock.snapshot?.questionType || "";

  return getQuestionTypeOption(questionType)?.title || normalizeText(questionType);
}

export function calculateQuestionPaperSummary({
  questionBlocks = [],
  setup = {},
  status = "draft",
} = {}) {
  const totalMarks = questionBlocks.reduce(
    (sum, questionBlock) => sum + normalizeMarks(questionBlock.marks),
    0,
  );
  const targetMarks = normalizeMarks(setup.maximumMarks);
  const remainingMarks = targetMarks > 0 ? Math.max(targetMarks - totalMarks, 0) : null;
  const overTargetMarks = targetMarks > 0 ? Math.max(totalMarks - targetMarks, 0) : null;
  const topicCoverageMap = new Map();
  const typeCoverageMap = new Map();

  questionBlocks.forEach((questionBlock) => {
    const marks = normalizeMarks(questionBlock.marks);
    const topicLabel = normalizeText(questionBlock.snapshot?.topicName, "Unspecified");
    const typeLabel = getQuestionTypeLabel(questionBlock);

    addMarksToCoverage(topicCoverageMap, topicLabel, marks);
    addMarksToCoverage(typeCoverageMap, typeLabel, marks);
  });

  return {
    className: setup.className || setup.classId || "Not set",
    difficulty: calculateDifficultySummary(questionBlocks),
    maximumMarks: setup.maximumMarks ?? null,
    overTargetMarks,
    questionCount: questionBlocks.length,
    remainingMarks,
    status,
    subjectName: setup.subjectName || setup.subjectId || "Not set",
    targetMarks,
    title: setup.title || "Untitled Paper",
    topicCoverage: mapCoverageToRows(topicCoverageMap),
    totalMarks,
    typeCoverage: mapCoverageToRows(typeCoverageMap),
  };
}
