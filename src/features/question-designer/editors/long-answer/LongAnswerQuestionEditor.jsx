import RichAnswerContentField from "../rich-answer/RichAnswerContentField.jsx";

function LongAnswerQuestionEditor({ error, onChange, value }) {
  return (
    <RichAnswerContentField
      ariaLabel="Long answer question content editor"
      description="Build the prompt with formatted text, images, tables, lists, and headings."
      error={error}
      errorId="long-answer-question-content-error"
      onChange={onChange}
      placeholder="Enter the long answer question..."
      title="Question Content"
      value={value}
    />
  );
}

export default LongAnswerQuestionEditor;
