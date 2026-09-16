import ShortAnswerModelAnswerEditor from "./ShortAnswerModelAnswerEditor.jsx";
import ShortAnswerQuestionEditor from "./ShortAnswerQuestionEditor.jsx";

function ShortAnswerEditor({
  editorActions,
  shortAnswer,
  validationErrors = {},
}) {
  return (
    <section
      aria-labelledby="short-answer-editor-title"
      className="question-type-editor short-answer-editor"
    >
      <div className="question-designer-section-header">
        <h3 id="short-answer-editor-title">Short Answer Editor</h3>
        <p>Create the rich question content and model answer.</p>
      </div>

      <ShortAnswerQuestionEditor
        error={validationErrors.questionContent}
        onChange={(content) =>
          editorActions.updateShortAnswerContent("questionContent", content)
        }
        value={shortAnswer.questionContent}
      />

      <ShortAnswerModelAnswerEditor
        error={validationErrors.modelAnswer}
        onChange={(content) =>
          editorActions.updateShortAnswerContent("modelAnswer", content)
        }
        value={shortAnswer.modelAnswer}
      />
    </section>
  );
}

export default ShortAnswerEditor;
