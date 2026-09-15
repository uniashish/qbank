import FormField from "../../../../components/common/FormField.jsx";

function InstructionsField({ onChange, value }) {
  const fieldId = "question-instructions";

  return (
    <FormField htmlFor={fieldId} label="Instructions">
      <textarea
        className="input question-details-textarea"
        id={fieldId}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Show all working. Choose the best answer."
        value={value}
      />
    </FormField>
  );
}

export default InstructionsField;
