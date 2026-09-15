import QuestionImagePicker from "../../components/media/QuestionImagePicker.jsx";
import TrueFalseAnswerSelector from "./TrueFalseAnswerSelector.jsx";

function TrueFalseEditor({
  editorActions,
  questionImage,
  trueFalse,
  validationErrors = {},
}) {
  return (
    <section
      className="question-type-editor true-false-editor"
      aria-labelledby="true-false-editor-title"
    >
      <div className="question-designer-section-header">
        <h3 id="true-false-editor-title">True / False Editor</h3>
        <p>Set the optional question image and correct answer.</p>
      </div>

      <QuestionImagePicker
        image={questionImage}
        onChange={editorActions.setQuestionImage}
        onError={editorActions.setQuestionImageError}
        onRemove={editorActions.removeQuestionImage}
      />

      <TrueFalseAnswerSelector
        correctAnswer={trueFalse.correctAnswer}
        error={validationErrors.correctAnswer}
        onChange={editorActions.setCorrectTrueFalseAnswer}
      />
    </section>
  );
}

export default TrueFalseEditor;
