const STATUS_LABELS = {
  draft: "Draft",
  final: "Final",
};

function QuestionPaperStatusBadge({ status }) {
  const normalizedStatus = status || "draft";
  const label = STATUS_LABELS[normalizedStatus] ?? normalizedStatus;

  return (
    <span
      className={[
        "question-paper-status-badge",
        `question-paper-status-badge--${normalizedStatus}`,
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export default QuestionPaperStatusBadge;
