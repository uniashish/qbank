import RichTextEditor from "../../../../components/rich-editor/RichTextEditor.jsx";

function ShortAnswerModelAnswerEditor({ error, onChange, value }) {
  const errorId = error ? "short-answer-model-answer-error" : undefined;

  return (
    <div className="short-answer-editor__field">
      <div className="short-answer-editor__field-header">
        <h4>Model Answer</h4>
        <p>Provide the expected answer for review and future answer keys.</p>
      </div>
      <RichTextEditor
        ariaDescribedBy={errorId}
        ariaLabel="Short answer model answer editor"
        onChange={onChange}
        placeholder="Enter the model answer..."
        value={value}
      />
      {error && (
        <p className="short-answer-editor__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default ShortAnswerModelAnswerEditor;
