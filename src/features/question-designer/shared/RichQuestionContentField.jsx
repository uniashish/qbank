import RichTextEditor from "../../../components/rich-editor/RichTextEditor.jsx";

function RichQuestionContentField({
  ariaLabel,
  className = "",
  error,
  errorId,
  label,
  onChange,
  placeholder,
  required = false,
  value,
}) {
  return (
    <div
      className={[
        "rich-question-content-field",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label && (
        <div className="rich-question-content-field__header">
          <span className="rich-question-content-field__label">
            {label}
            {required && <span aria-hidden="true"> *</span>}
          </span>
        </div>
      )}
      <RichTextEditor
        ariaDescribedBy={error ? errorId : undefined}
        ariaLabel={ariaLabel}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      {error && (
        <p
          className="rich-question-content-field__error"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default RichQuestionContentField;
