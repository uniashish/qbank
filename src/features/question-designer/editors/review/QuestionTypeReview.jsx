import { QUESTION_TYPES } from "../../constants/questionTypes.js";
import ReviewSection from "../../components/review/ReviewSection.jsx";
import FillBlanksReview from "./fill-blanks/FillBlanksReview.jsx";
import MultipleChoiceReview from "./multiple-choice/MultipleChoiceReview.jsx";
import TrueFalseReview from "./true-false/TrueFalseReview.jsx";

function UnsupportedReview() {
  return (
    <ReviewSection
      title="Answer / Options"
      titleId="question-review-unsupported-answer-title"
    >
      <p className="question-review-instructions">
        Review is not available for this question type yet.
      </p>
    </ReviewSection>
  );
}

function QuestionTypeReview({ questionDraft }) {
  switch (questionDraft.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return <FillBlanksReview answerData={questionDraft.answerData} />;

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return <MultipleChoiceReview answerData={questionDraft.answerData} />;

    case QUESTION_TYPES.TRUE_FALSE:
      return <TrueFalseReview answerData={questionDraft.answerData} />;

    default:
      return <UnsupportedReview />;
  }
}

export default QuestionTypeReview;
