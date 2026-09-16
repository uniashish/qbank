import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";

function MatchPairRow({
  canRemove = false,
  errors = {},
  index,
  onRemove,
  onTextChange,
  pair,
}) {
  const leftInputId = `match-pair-${pair.id}-left`;
  const rightInputId = `match-pair-${pair.id}-right`;
  const leftErrorId = errors.left ? `${leftInputId}-error` : undefined;
  const rightErrorId = errors.right ? `${rightInputId}-error` : undefined;
  const rowNumber = index + 1;

  return (
    <div className="match-pair-row">
      <span className="match-pair-row__number" aria-hidden="true">
        {rowNumber}.
      </span>

      <div className="match-pair-row__field">
        <label className="sr-only" htmlFor={leftInputId}>
          Column A text for pair {rowNumber}
        </label>
        <input
          aria-describedby={leftErrorId}
          aria-invalid={Boolean(errors.left)}
          className="input"
          id={leftInputId}
          onChange={(event) =>
            onTextChange(pair.id, "left", event.target.value)
          }
          placeholder="Column A"
          type="text"
          value={pair.left}
        />
        {errors.left && (
          <p className="form-field__error" id={leftErrorId}>
            {errors.left}
          </p>
        )}
      </div>

      <span className="match-pair-row__link" aria-hidden="true">
        ↔
      </span>

      <div className="match-pair-row__field">
        <label className="sr-only" htmlFor={rightInputId}>
          Column B text for pair {rowNumber}
        </label>
        <input
          aria-describedby={rightErrorId}
          aria-invalid={Boolean(errors.right)}
          className="input"
          id={rightInputId}
          onChange={(event) =>
            onTextChange(pair.id, "right", event.target.value)
          }
          placeholder="Column B"
          type="text"
          value={pair.right}
        />
        {errors.right && (
          <p className="form-field__error" id={rightErrorId}>
            {errors.right}
          </p>
        )}
      </div>

      {canRemove && (
        <Button
          aria-label={`Remove pair ${rowNumber}`}
          className="match-pair-row__remove"
          onClick={() => onRemove(pair.id)}
          variant="secondary"
        >
          <Icon name="close" size={17} />
          Remove
        </Button>
      )}
    </div>
  );
}

export default MatchPairRow;
