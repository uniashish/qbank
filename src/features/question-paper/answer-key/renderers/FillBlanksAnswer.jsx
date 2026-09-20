function FillBlanksAnswer({ answer }) {
  if (answer.blanks.length === 0) {
    return <p className="answer-key-empty">No accepted answers defined.</p>;
  }

  return (
    <ol className="answer-key-list">
      {answer.blanks.map((blank) => (
        <li key={blank.id}>
          {blank.acceptedAnswers.length > 0
            ? blank.acceptedAnswers.join(" / ")
            : "No accepted answer"}
        </li>
      ))}
    </ol>
  );
}

export default FillBlanksAnswer;
