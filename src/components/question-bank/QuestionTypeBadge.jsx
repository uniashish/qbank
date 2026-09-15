function QuestionTypeBadge({ label }) {
  return <span className="question-bank-badge">{label || "Unknown type"}</span>;
}

export default QuestionTypeBadge;
