import RichTextEditor from "../../../../components/rich-editor/RichTextEditor.jsx";

function LongAnswerAnswer({ answer }) {
  if (!answer.hasModelAnswer) {
    return <p className="answer-key-empty">No model answer or marking guide stored.</p>;
  }

  return (
    <div className="answer-key-rich-answer">
      <RichTextEditor
        ariaLabel="Long answer model answer or marking guide"
        readOnly
        value={answer.modelAnswer}
      />
    </div>
  );
}

export default LongAnswerAnswer;
