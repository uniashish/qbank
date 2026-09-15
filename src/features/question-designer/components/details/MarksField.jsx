import FormField from "../../../../components/common/FormField.jsx";

function MarksField({ error, onChange, value }) {
  const fieldId = "question-marks";
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FormField error={error} htmlFor={fieldId} label="Marks" required>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input"
        id={fieldId}
        inputMode="numeric"
        min="1"
        onChange={(event) => onChange(event.target.value)}
        step="1"
        type="number"
        value={value}
      />
    </FormField>
  );
}

export default MarksField;
