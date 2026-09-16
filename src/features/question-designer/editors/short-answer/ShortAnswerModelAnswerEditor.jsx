import RichAnswerContentField from "../rich-answer/RichAnswerContentField.jsx";

function ShortAnswerModelAnswerEditor({ error, onChange, value }) {
  return (
    <RichAnswerContentField
      ariaLabel="Short answer model answer editor"
      description="Provide the expected answer for review and future answer keys."
      error={error}
      errorId="short-answer-model-answer-error"
      onChange={onChange}
      placeholder="Enter the model answer..."
      title="Model Answer"
      value={value}
    />
  );
}

export default ShortAnswerModelAnswerEditor;
