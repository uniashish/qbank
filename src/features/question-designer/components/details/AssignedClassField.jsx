import FormField from "../../../../components/common/FormField.jsx";

function AssignedClassField({ classOptions = [], error, onChange, value }) {
  const fieldId = "question-assigned-class";
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FormField
      error={error}
      htmlFor={fieldId}
      label="Assigned Class"
      required
    >
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input question-details-select"
        id={fieldId}
        onChange={(event) => onChange(event.target.value || null)}
        value={value ?? ""}
      >
        <option value="">Select class</option>
        {classOptions.map((classOption) => (
          <option key={classOption.id} value={classOption.id}>
            {classOption.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export default AssignedClassField;
