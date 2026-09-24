import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";
import RichQuestionContentField from "../../shared/RichQuestionContentField.jsx";

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
        <RichQuestionContentField
          ariaLabel={`Column A editor for pair ${rowNumber}`}
          className="match-pair-row__rich-field"
          error={errors.left}
          errorId={leftErrorId}
          onChange={(content) =>
            onTextChange(pair.id, "leftContent", content)
          }
          placeholder="Column A"
          value={pair.leftContent}
        />
      </div>

      <span className="match-pair-row__link" aria-hidden="true">
        ↔
      </span>

      <div className="match-pair-row__field">
        <RichQuestionContentField
          ariaLabel={`Column B editor for pair ${rowNumber}`}
          className="match-pair-row__rich-field"
          error={errors.right}
          errorId={rightErrorId}
          onChange={(content) =>
            onTextChange(pair.id, "rightContent", content)
          }
          placeholder="Column B"
          value={pair.rightContent}
        />
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
