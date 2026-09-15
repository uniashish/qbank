const TRUE_FALSE_OPTIONS = [
  {
    label: "True",
    value: true,
  },
  {
    label: "False",
    value: false,
  },
];

function TrueFalseAnswerSelector({
  correctAnswer = null,
  error = "",
  onChange,
}) {
  const errorId = error ? "true-false-correct-answer-error" : undefined;

  return (
    <section
      className="true-false-answer-selector"
      aria-labelledby="true-false-correct-answer-title"
    >
      <fieldset
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="true-false-answer-selector__fieldset"
      >
        <legend
          className="true-false-answer-selector__legend"
          id="true-false-correct-answer-title"
        >
          Correct Answer
        </legend>

        <div className="true-false-answer-selector__options">
          {TRUE_FALSE_OPTIONS.map((option) => {
            const inputId = `true-false-answer-${option.label.toLowerCase()}`;
            const isSelected = correctAnswer === option.value;

            return (
              <label
                className={[
                  "true-false-answer-selector__option",
                  isSelected
                    ? "true-false-answer-selector__option--selected"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                htmlFor={inputId}
                key={option.label}
              >
                <input
                  checked={isSelected}
                  className="true-false-answer-selector__radio"
                  id={inputId}
                  name="true-false-correct-answer"
                  onChange={() => onChange(option.value)}
                  type="radio"
                  value={String(option.value)}
                />
                <span className="true-false-answer-selector__label">
                  {option.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p className="form-field__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default TrueFalseAnswerSelector;
