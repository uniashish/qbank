function FormField({
  children,
  error,
  helperText,
  htmlFor,
  label,
  required = false,
}) {
  const helperId = helperText ? `${htmlFor}-helper` : undefined;
  const errorId = error ? `${htmlFor}-error` : undefined;

  return (
    <div className="form-field">
      <label className="form-field__label" htmlFor={htmlFor}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {helperText && (
        <p className="form-field__helper" id={helperId}>
          {helperText}
        </p>
      )}
      {error && (
        <p className="form-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
