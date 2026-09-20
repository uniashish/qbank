export const DIFFICULTY_MARK_WEIGHTS = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_ORDER = ["easy", "medium", "hard"];

function normalizeDifficulty(difficulty) {
  return DIFFICULTY_MARK_WEIGHTS[difficulty] ? difficulty : "medium";
}

function normalizeMarks(value) {
  const marks = Number(value);

  return Number.isFinite(marks) && marks > 0 ? marks : 0;
}

export function calculateDifficultySummary(questionBlocks = []) {
  const distribution = Object.fromEntries(
    DIFFICULTY_ORDER.map((difficulty) => [difficulty, 0]),
  );
  let weightedTotal = 0;
  let totalMarks = 0;

  questionBlocks.forEach((questionBlock) => {
    const difficulty = normalizeDifficulty(
      questionBlock.difficulty || questionBlock.snapshot?.difficulty,
    );
    const marks = normalizeMarks(questionBlock.marks);

    distribution[difficulty] += marks;
    totalMarks += marks;
    weightedTotal += marks * DIFFICULTY_MARK_WEIGHTS[difficulty];
  });

  const averageWeight = totalMarks > 0 ? weightedTotal / totalMarks : 0;
  const overallDifficulty =
    averageWeight === 0
      ? "Not set"
      : averageWeight < 1.67
        ? DIFFICULTY_LABELS.easy
        : averageWeight < 2.34
          ? DIFFICULTY_LABELS.medium
          : DIFFICULTY_LABELS.hard;

  return {
    averageWeight,
    distribution: DIFFICULTY_ORDER.map((difficulty) => ({
      difficulty,
      label: DIFFICULTY_LABELS[difficulty],
      marks: distribution[difficulty],
    })),
    overallDifficulty,
  };
}
