import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";
import RichQuestionContentField from "../../shared/RichQuestionContentField.jsx";

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

      <span className="multiple-choice-option-row__label">
        Option {label}
      </span>

      <div className="multiple-choice-option-row__field">
        <RichQuestionContentField
          ariaLabel={`Option ${label} editor`}
          className="multiple-choice-option-row__rich-field"
          error={error}
          errorId={errorId}
          onChange={(content) => onTextChange(option.id, content)}
          placeholder={`Option ${label}`}
          value={option.content}
        />
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
