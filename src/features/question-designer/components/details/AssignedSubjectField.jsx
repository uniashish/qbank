import FormField from "../../../../components/common/FormField.jsx";

function AssignedSubjectField({
  disabled = false,
  error,
  onChange,
  subjectOptions = [],
  value,
}) {
  const fieldId = "question-assigned-subject";
  const helperText = disabled ? "Choose a class first." : undefined;
  const describedByIds = [
    helperText ? `${fieldId}-helper` : "",
    error ? `${fieldId}-error` : "",
  ].filter(Boolean);
  const describedBy =
    describedByIds.length > 0 ? describedByIds.join(" ") : undefined;

  return (
    <FormField
      error={error}
      helperText={helperText}
      htmlFor={fieldId}
      label="Assigned Subject"
      required
    >
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input question-details-select"
        disabled={disabled}
        id={fieldId}
        onChange={(event) => onChange(event.target.value || null)}
        value={value ?? ""}
      >
        <option value="">Select subject</option>
        {subjectOptions.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export default AssignedSubjectField;
