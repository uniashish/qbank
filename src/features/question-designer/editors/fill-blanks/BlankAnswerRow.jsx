import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";
import AddBlankButton from "./AddBlankButton.jsx";
import { MAX_FILL_BLANK_ACCEPTED_ANSWERS } from "./fillBlanksUtils.js";

function BlankAnswerRow({
  blank,
  blankNumber,
  errors = {},
  onAddAnswer,
  onAnswerChange,
  onRemoveAnswer,
}) {
  const acceptedAnswers = blank.acceptedAnswers ?? [""];
  const answerErrors = errors.acceptedAnswers ?? {};
  const canAddAnswer =
    acceptedAnswers.length < MAX_FILL_BLANK_ACCEPTED_ANSWERS;
  const groupErrorId = errors.answers
    ? `fill-blank-${blank.id}-group-error`
    : undefined;

  return (
    <section
      aria-labelledby={`fill-blank-${blank.id}-title`}
      className="fill-blanks-answer-row"
    >
      <div className="fill-blanks-answer-row__header">
        <h5 id={`fill-blank-${blank.id}-title`}>Blank {blankNumber}</h5>
      </div>

      {errors.answers && (
        <p className="form-field__error" id={groupErrorId} role="alert">
          {errors.answers}
        </p>
      )}

      <div className="fill-blanks-answer-row__answers">
        {acceptedAnswers.map((answer, answerIndex) => {
          const inputId = `fill-blank-${blank.id}-answer-${answerIndex + 1}`;
          const error = answerErrors[answerIndex];
          const errorId = error ? `${inputId}-error` : undefined;

          return (
            <div className="fill-blanks-answer-input" key={inputId}>
              <label className="sr-only" htmlFor={inputId}>
                Accepted answer {answerIndex + 1} for blank {blankNumber}
              </label>
              <input
                aria-describedby={errorId}
                aria-invalid={Boolean(error)}
                className="input"
                id={inputId}
                onChange={(event) =>
                  onAnswerChange(blank.id, answerIndex, event.target.value)
                }
                placeholder={
                  answerIndex === 0
                    ? `Answer for blank ${blankNumber}`
                    : "Alternative accepted answer"
                }
                type="text"
                value={answer}
              />
              {acceptedAnswers.length > 1 && (
                <Button
                  aria-label={`Remove accepted answer ${answerIndex + 1} for blank ${blankNumber}`}
                  className="fill-blanks-answer-input__remove"
                  onClick={() => onRemoveAnswer(blank.id, answerIndex)}
                  variant="secondary"
                >
                  <Icon name="close" size={17} />
                  Remove
                </Button>
              )}
              {error && (
                <p className="form-field__error" id={errorId}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <AddBlankButton
        disabled={!canAddAnswer}
        onClick={() => onAddAnswer(blank.id)}
      />
    </section>
  );
}

export default BlankAnswerRow;
