const DIFFICULTY_CLASS_NAMES = {
  easy: "question-bank-badge--easy",
  hard: "question-bank-badge--hard",
  medium: "question-bank-badge--medium",
};

function DifficultyBadge({ difficulty, label }) {
  const classes = [
    "question-bank-badge",
    "question-bank-badge--difficulty",
    DIFFICULTY_CLASS_NAMES[difficulty] ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={classes}>{label || "Unknown"}</span>;
}

export default DifficultyBadge;
