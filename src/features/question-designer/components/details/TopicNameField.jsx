import FormField from "../../../../components/common/FormField.jsx";

function TopicNameField({ error, onChange, value }) {
  const fieldId = "question-topic-name";
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FormField error={error} htmlFor={fieldId} label="Topic Name" required>
      <input
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input"
        id={fieldId}
        maxLength={100}
        onChange={(event) => onChange(event.target.value)}
        placeholder="e.g. Algebra, Integers, Photosynthesis"
        type="text"
        value={value}
      />
    </FormField>
  );
}

export default TopicNameField;
