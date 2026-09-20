function MatchFollowingAnswer({ answer }) {
  if (answer.mappings.length === 0) {
    return <p className="answer-key-empty">No matching pairs defined.</p>;
  }

  return (
    <ol className="answer-key-list answer-key-list--matches">
      {answer.mappings.map((mapping) => (
        <li key={mapping.pairId}>
          <span>{mapping.leftLabel}</span>
          <span aria-hidden="true">→</span>
          <span>{mapping.rightLabel || "?"}</span>
        </li>
      ))}
    </ol>
  );
}

export default MatchFollowingAnswer;
