import FormField from "../common/FormField.jsx";

function SchoolFormField({
  autoComplete,
  error,
  helperText,
  label,
  name,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}) {
  return (
    <FormField
      error={error}
      helperText={helperText}
      htmlFor={`school-${name}`}
      label={label}
      required={required}
    >
      <input
        aria-describedby={error ? `school-${name}-error` : undefined}
        aria-invalid={Boolean(error)}
        autoComplete={autoComplete}
        className="input"
        id={`school-${name}`}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </FormField>
  );
}

export default SchoolFormField;
