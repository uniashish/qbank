import QuestionImagePicker from "../../components/media/QuestionImagePicker.jsx";
import MultipleChoiceOptionsList from "./MultipleChoiceOptionsList.jsx";

function MultipleChoiceEditor({
  editorActions,
  multipleChoice,
  questionImage,
  validationErrors = {},
}) {
  return (
    <section
      className="question-type-editor multiple-choice-editor"
      aria-labelledby="multiple-choice-editor-title"
    >
      <div className="question-designer-section-header">
        <h3 id="multiple-choice-editor-title">Multiple Choice Editor</h3>
        <p>Set the optional question image and answer choices.</p>
      </div>

      <QuestionImagePicker
        image={questionImage}
        onChange={editorActions.setQuestionImage}
        onError={editorActions.setQuestionImageError}
        onRemove={editorActions.removeQuestionImage}
      />

      <MultipleChoiceOptionsList
        multipleChoice={multipleChoice}
        onAddOption={editorActions.addMultipleChoiceOption}
        onCorrectChange={editorActions.setCorrectMultipleChoiceOption}
        onRemoveOption={editorActions.removeMultipleChoiceOption}
        onTextChange={editorActions.updateMultipleChoiceOption}
        validationErrors={validationErrors}
      />
    </section>
  );
}

export default MultipleChoiceEditor;
