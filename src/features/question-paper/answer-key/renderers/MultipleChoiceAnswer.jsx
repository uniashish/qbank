function MultipleChoiceAnswer({ answer }) {
  return (
    <p className="answer-key-answer answer-key-answer--inline">
      {answer.optionLabel || "No correct option selected"}
    </p>
  );
}

export default MultipleChoiceAnswer;
