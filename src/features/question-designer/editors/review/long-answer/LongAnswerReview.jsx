import RichTextEditor from "../../../../../components/rich-editor/RichTextEditor.jsx";
import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewField from "../../../components/review/ReviewField.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";

function LongAnswerReview({ answerData = {} }) {
  const suggestedWordCount = answerData.suggestedWordCount
    ? `${answerData.suggestedWordCount} words`
    : "";

  return (
    <div className="rich-answer-review long-answer-review">
      <ReviewSection
        className="rich-answer-review__section"
        title="Question"
        titleId="question-review-long-answer-question-title"
      >
        <RichTextEditor
          ariaLabel="Long answer question preview"
          readOnly
          value={answerData.questionContent}
        />
      </ReviewSection>

      <ReviewSection
        className="rich-answer-review__section"
        title="Model Answer / Marking Guide"
        titleId="question-review-long-answer-model-answer-title"
      >
        <RichTextEditor
          ariaLabel="Long answer model answer marking guide preview"
          readOnly
          value={answerData.modelAnswer}
        />
      </ReviewSection>

      <ReviewSection
        title="Suggested Word Count"
        titleId="question-review-long-answer-word-count-title"
      >
        <dl className="question-review-metadata question-review-metadata--single">
          <ReviewField label="Suggested Word Count" value={suggestedWordCount}>
            {suggestedWordCount || <ReviewEmptyValue>Not specified</ReviewEmptyValue>}
          </ReviewField>
        </dl>
      </ReviewSection>
    </div>
  );
}

export default LongAnswerReview;
