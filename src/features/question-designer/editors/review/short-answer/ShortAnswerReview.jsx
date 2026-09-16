import RichTextEditor from "../../../../../components/rich-editor/RichTextEditor.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";

function ShortAnswerReview({ answerData = {} }) {
  return (
    <div className="short-answer-review">
      <ReviewSection
        className="short-answer-review__section"
        title="Question"
        titleId="question-review-short-answer-question-title"
      >
        <RichTextEditor
          ariaLabel="Short answer question preview"
          readOnly
          value={answerData.questionContent}
        />
      </ReviewSection>

      <ReviewSection
        className="short-answer-review__section"
        title="Model Answer"
        titleId="question-review-short-answer-model-answer-title"
      >
        <RichTextEditor
          ariaLabel="Short answer model answer preview"
          readOnly
          value={answerData.modelAnswer}
        />
      </ReviewSection>
    </div>
  );
}

export default ShortAnswerReview;
