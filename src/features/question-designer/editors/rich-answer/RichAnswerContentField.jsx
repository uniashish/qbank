import RichTextEditor from "../../../../components/rich-editor/RichTextEditor.jsx";

function RichAnswerContentField({
  ariaLabel,
  description,
  error,
  errorId,
  onChange,
  placeholder,
  title,
  value,
}) {
  return (
    <div className="rich-answer-editor__field">
      <div className="rich-answer-editor__field-header">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
      <RichTextEditor
        ariaDescribedBy={error ? errorId : undefined}
        ariaLabel={ariaLabel}
        onChange={onChange}
        placeholder={placeholder}
        value={value}
      />
      {error && (
        <p className="rich-answer-editor__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default RichAnswerContentField;
