function TrueFalseAnswer({ answer }) {
  return (
    <p className="answer-key-answer answer-key-answer--inline">
      {answer.value || "No correct answer selected"}
    </p>
  );
}

export default TrueFalseAnswer;
