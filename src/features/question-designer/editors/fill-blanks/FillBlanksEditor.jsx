import QuestionImagePicker from "../../components/media/QuestionImagePicker.jsx";
import BlankAnswerList from "./BlankAnswerList.jsx";

function FillBlanksEditor({
  editorActions,
  fillBlanks = {},
  prompt,
  questionImage,
  validationErrors = {},
}) {
  return (
    <section
      className="question-type-editor fill-blanks-editor"
      aria-labelledby="fill-blanks-editor-title"
    >
      <div className="question-designer-section-header">
        <h3 id="fill-blanks-editor-title">Fill in the Blanks Editor</h3>
        <p>Set the optional question image and accepted answers for each [blank] marker.</p>
      </div>

      <QuestionImagePicker
        image={questionImage}
        onChange={editorActions.setQuestionImage}
        onError={editorActions.setQuestionImageError}
        onRemove={editorActions.removeQuestionImage}
      />

      <BlankAnswerList
        fillBlanks={fillBlanks}
        onAddAnswer={editorActions.addFillBlankAcceptedAnswer}
        onAnswerChange={editorActions.updateFillBlankAcceptedAnswer}
        onRemoveAnswer={editorActions.removeFillBlankAcceptedAnswer}
        prompt={prompt}
        validationErrors={validationErrors}
      />
    </section>
  );
}

export default FillBlanksEditor;
