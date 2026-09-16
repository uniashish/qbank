import LongAnswerModelAnswerEditor from "./LongAnswerModelAnswerEditor.jsx";
import LongAnswerQuestionEditor from "./LongAnswerQuestionEditor.jsx";
import SuggestedWordCountField from "./SuggestedWordCountField.jsx";

function LongAnswerEditor({
  editorActions,
  longAnswer,
  validationErrors = {},
}) {
  return (
    <section
      aria-labelledby="long-answer-editor-title"
      className="question-type-editor long-answer-editor"
    >
      <div className="question-designer-section-header">
        <h3 id="long-answer-editor-title">Long Answer Editor</h3>
        <p>Create the rich prompt, marking guide, and optional word count.</p>
      </div>

      <LongAnswerQuestionEditor
        error={validationErrors.questionContent}
        onChange={(content) =>
          editorActions.updateLongAnswerContent("questionContent", content)
        }
        value={longAnswer.questionContent}
      />

      <LongAnswerModelAnswerEditor
        error={validationErrors.modelAnswer}
        onChange={(content) =>
          editorActions.updateLongAnswerContent("modelAnswer", content)
        }
        value={longAnswer.modelAnswer}
      />

      <SuggestedWordCountField
        error={validationErrors.suggestedWordCount}
        onChange={editorActions.updateLongAnswerSuggestedWordCount}
        value={longAnswer.suggestedWordCount}
      />
    </section>
  );
}

export default LongAnswerEditor;
