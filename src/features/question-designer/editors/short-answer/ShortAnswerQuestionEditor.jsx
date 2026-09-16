import RichTextEditor from "../../../../components/rich-editor/RichTextEditor.jsx";

function ShortAnswerQuestionEditor({ error, onChange, value }) {
  const errorId = error ? "short-answer-question-content-error" : undefined;

  return (
    <div className="short-answer-editor__field">
      <div className="short-answer-editor__field-header">
        <h4>Question Content</h4>
        <p>Build the question with text, images, tables, lists, and headings.</p>
      </div>
      <RichTextEditor
        ariaDescribedBy={errorId}
        ariaLabel="Short answer question content editor"
        onChange={onChange}
        placeholder="Enter the short answer question..."
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

export default ShortAnswerQuestionEditor;
