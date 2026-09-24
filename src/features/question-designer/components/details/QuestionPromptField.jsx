import RichQuestionContentField from "../../shared/RichQuestionContentField.jsx";

function QuestionPromptField({ error, onChange, value }) {
  const fieldId = "question-prompt";

  return (
    <RichQuestionContentField
      ariaLabel="Question text or prompt editor"
      className="question-details-rich-prompt"
      error={error}
      errorId={`${fieldId}-error`}
      label="Question Text / Prompt"
      onChange={onChange}
      placeholder="Enter the question prompt"
      required
      value={value}
    />
  );
}

export default QuestionPromptField;
