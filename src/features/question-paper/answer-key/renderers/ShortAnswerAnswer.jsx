import RichTextEditor from "../../../../components/rich-editor/RichTextEditor.jsx";

function ShortAnswerAnswer({ answer }) {
  if (!answer.hasModelAnswer) {
    return <p className="answer-key-empty">No model answer stored.</p>;
  }

  return (
    <div className="answer-key-rich-answer">
      <RichTextEditor
        ariaLabel="Short answer model answer"
        readOnly
        value={answer.modelAnswer}
      />
    </div>
  );
}

export default ShortAnswerAnswer;
