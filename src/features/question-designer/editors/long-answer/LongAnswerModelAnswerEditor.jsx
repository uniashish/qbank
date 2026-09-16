import RichAnswerContentField from "../rich-answer/RichAnswerContentField.jsx";

function LongAnswerModelAnswerEditor({ error, onChange, value }) {
  return (
    <RichAnswerContentField
      ariaLabel="Long answer model answer marking guide editor"
      description="Provide the expected response, scoring points, or marking guidance."
      error={error}
      errorId="long-answer-model-answer-error"
      onChange={onChange}
      placeholder="Enter the model answer or marking guide..."
      title="Model Answer / Marking Guide"
      value={value}
    />
  );
}

export default LongAnswerModelAnswerEditor;
