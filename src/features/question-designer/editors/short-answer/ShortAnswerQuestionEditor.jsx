import RichAnswerContentField from "../rich-answer/RichAnswerContentField.jsx";

function ShortAnswerQuestionEditor({ error, onChange, value }) {
  return (
    <RichAnswerContentField
      ariaLabel="Short answer question content editor"
      description="Build the question with text, images, tables, lists, and headings."
      error={error}
      errorId="short-answer-question-content-error"
      onChange={onChange}
      placeholder="Enter the short answer question..."
      title="Question Content"
      value={value}
    />
  );
}

export default ShortAnswerQuestionEditor;
