import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewField from "../../../components/review/ReviewField.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";

function getCorrectAnswerLabel(correctAnswer) {
  if (correctAnswer === true) {
    return "True";
  }

  if (correctAnswer === false) {
    return "False";
  }

  return "";
}

function TrueFalseReview({ answerData = {} }) {
  const correctAnswerLabel = getCorrectAnswerLabel(answerData.correctAnswer);

  return (
    <ReviewSection
      title="Answer"
      titleId="question-review-true-false-title"
    >
      <dl className="question-review-metadata question-review-metadata--single">
        <ReviewField label="Correct Answer" value={correctAnswerLabel}>
          {correctAnswerLabel || (
            <ReviewEmptyValue>No correct answer selected</ReviewEmptyValue>
          )}
        </ReviewField>
      </dl>
    </ReviewSection>
  );
}

export default TrueFalseReview;
