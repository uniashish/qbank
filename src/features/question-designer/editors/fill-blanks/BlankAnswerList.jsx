import {
  countBlankMarkers,
  MAX_FILL_BLANKS,
} from "./fillBlanksUtils.js";
import BlankAnswerRow from "./BlankAnswerRow.jsx";

function BlankAnswerList({
  fillBlanks = {},
  onAddAnswer,
  onAnswerChange,
  onRemoveAnswer,
  prompt,
  validationErrors = {},
}) {
  const markerCount = countBlankMarkers(prompt);
  const blanks = fillBlanks.blanks ?? [];

  return (
    <section className="fill-blanks-answers" aria-labelledby="fill-blanks-title">
      <div className="fill-blanks-answers__header">
        <h4 id="fill-blanks-title">Blank Answers</h4>
        <span>
          {Math.min(markerCount, MAX_FILL_BLANKS)}/{MAX_FILL_BLANKS}
        </span>
      </div>

      {markerCount > 0 && validationErrors.markerCount && (
        <p className="form-field__error" role="alert">
          {validationErrors.markerCount}
        </p>
      )}

      {validationErrors.blanks && (
        <p className="form-field__error" role="alert">
          {validationErrors.blanks}
        </p>
      )}

      {markerCount === 0 ? (
        <p className="fill-blanks-empty-message">
          Add at least one [blank] marker to the question prompt before defining
          answers.
        </p>
      ) : (
        <div className="fill-blanks-answers__list">
          {blanks.map((blank, index) => (
            <BlankAnswerRow
              blank={blank}
              blankNumber={index + 1}
              errors={validationErrors.blankAnswers?.[blank.id]}
              key={blank.id}
              onAddAnswer={onAddAnswer}
              onAnswerChange={onAnswerChange}
              onRemoveAnswer={onRemoveAnswer}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default BlankAnswerList;
