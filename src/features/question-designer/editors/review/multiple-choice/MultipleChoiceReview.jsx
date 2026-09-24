import RichDocumentRenderer from "../../../../../components/rich-editor/RichDocumentRenderer.jsx";
import { getOptionLabel } from "../../../constants/optionLabels.js";
import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewField from "../../../components/review/ReviewField.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";
import { normalizeRichTextContent } from "../../../utils/richTextContent.js";

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
      ? getOptionLabel(correctOptionIndex)
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
                <RichDocumentRenderer
                  ariaLabel={`Option ${optionLabel} preview`}
                  className="multiple-choice-review__text"
                  content={normalizeRichTextContent(option.content, option.text)}
                />
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
            {correctOption ? (
              <div className="multiple-choice-review__correct-answer">
                <span>{correctAnswerLabel}.</span>
                <RichDocumentRenderer
                  ariaLabel={`Correct option ${correctAnswerLabel} preview`}
                  className="multiple-choice-review__text"
                  content={normalizeRichTextContent(
                    correctOption.content,
                    correctOption.text,
                  )}
                />
              </div>
            ) : (
              <ReviewEmptyValue>No correct answer selected</ReviewEmptyValue>
            )}
          </ReviewField>
        </dl>
      </div>
    </ReviewSection>
  );
}

export default MultipleChoiceReview;
