import FormField from "../../../../components/common/FormField.jsx";

function QuestionPromptField({ error, onChange, value }) {
  const fieldId = "question-prompt";
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FormField
      error={error}
      htmlFor={fieldId}
      label="Question Text / Prompt"
      required
    >
      <textarea
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input question-details-textarea question-details-textarea--prompt"
        id={fieldId}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter the question prompt"
        value={value}
      />
    </FormField>
  );
}

export default QuestionPromptField;
