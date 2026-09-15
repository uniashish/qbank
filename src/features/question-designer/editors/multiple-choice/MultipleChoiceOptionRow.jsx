import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";

function MultipleChoiceOptionRow({
  canRemove = false,
  error,
  isCorrect = false,
  label,
  onCorrectChange,
  onRemove,
  onTextChange,
  option,
}) {
  const inputId = `multiple-choice-option-${option.id}`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="multiple-choice-option-row">
      <input
        aria-label={`Mark option ${label} as correct`}
        checked={isCorrect}
        className="multiple-choice-option-row__radio"
        name="multiple-choice-correct-option"
        onChange={() => onCorrectChange(option.id)}
        type="radio"
      />

      <label
        className="multiple-choice-option-row__label"
        htmlFor={inputId}
      >
        Option {label}
      </label>

      <div className="multiple-choice-option-row__field">
        <input
          aria-describedby={errorId}
          aria-invalid={Boolean(error)}
          className="input"
          id={inputId}
          onChange={(event) => onTextChange(option.id, event.target.value)}
          placeholder={`Option ${label}`}
          type="text"
          value={option.text}
        />
        {error && (
          <p className="form-field__error" id={errorId}>
            {error}
          </p>
        )}
      </div>

      {canRemove && (
        <Button
          aria-label={`Remove option ${label}`}
          className="multiple-choice-option-row__remove"
          onClick={() => onRemove(option.id)}
          variant="secondary"
        >
          <Icon name="close" size={17} />
          Remove
        </Button>
      )}
    </div>
  );
}

export default MultipleChoiceOptionRow;
