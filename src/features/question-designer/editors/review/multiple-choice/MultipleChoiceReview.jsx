import { getOptionLabel } from "../../../constants/optionLabels.js";
import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewField from "../../../components/review/ReviewField.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";

function MultipleChoiceReview({ answerData = {} }) {
  const options = answerData.options ?? [];
  const correctOption = options.find(
    (option) => option.id === answerData.correctOptionId,
  );
  const correctOptionIndex = options.findIndex(
    (option) => option.id === answerData.correctOptionId,
  );
  const correctAnswerLabel =
    correctOption && correctOptionIndex >= 0
      ? `${getOptionLabel(correctOptionIndex)}. ${correctOption.text}`
      : "";

  return (
    <ReviewSection
      title="Answer / Options"
      titleId="question-review-multiple-choice-title"
    >
      <div className="multiple-choice-review">
        <h5>Answer Options</h5>
        <ol className="multiple-choice-review__options">
          {options.map((option, index) => {
            const optionLabel = getOptionLabel(index);
            const isCorrect = option.id === answerData.correctOptionId;

            return (
              <li
                className={[
                  "multiple-choice-review__option",
                  isCorrect ? "multiple-choice-review__option--correct" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={option.id}
              >
                <span className="multiple-choice-review__label">
                  {optionLabel}.
                </span>
                <span className="multiple-choice-review__text">
                  {option.text}
                </span>
                {isCorrect && (
                  <span className="multiple-choice-review__correct-badge">
                    {"\u2713"} Correct answer
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        <dl className="question-review-metadata question-review-metadata--single">
          <ReviewField label="Correct Answer" value={correctAnswerLabel}>
            {correctAnswerLabel || (
              <ReviewEmptyValue>No correct answer selected</ReviewEmptyValue>
            )}
          </ReviewField>
        </dl>
      </div>
    </ReviewSection>
  );
}

export default MultipleChoiceReview;
