import Icon from "../../../components/common/Icon.jsx";

function QuestionBlockToolbar({
  canMoveDown,
  canMoveUp,
  marks,
  onMarksChange,
  onMoveDown,
  onMoveUp,
  onRemove,
  questionNumber,
}) {
  return (
    <div className="question-block-toolbar" aria-label="Question block controls">
      <label className="question-block-toolbar__field">
        <span>Number</span>
        <input
          aria-label="Question number"
          readOnly
          type="text"
          value={questionNumber}
        />
      </label>

      <label className="question-block-toolbar__field question-block-toolbar__field--marks">
        <span>Marks</span>
        <input
          aria-label="Question marks"
          inputMode="numeric"
          min="1"
          onChange={(event) => onMarksChange(event.target.value)}
          step="1"
          type="number"
          value={marks}
        />
      </label>

      <div className="question-block-toolbar__actions">
        <button
          aria-label="Move question up"
          disabled={!canMoveUp}
          onClick={onMoveUp}
          title="Move up"
          type="button"
        >
          <Icon name="arrowUp" size={16} />
        </button>
        <button
          aria-label="Move question down"
          disabled={!canMoveDown}
          onClick={onMoveDown}
          title="Move down"
          type="button"
        >
          <Icon name="arrowDown" size={16} />
        </button>
        <button
          aria-label="Remove question"
          className="question-block-toolbar__remove"
          onClick={onRemove}
          title="Remove"
          type="button"
        >
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
}

export default QuestionBlockToolbar;
