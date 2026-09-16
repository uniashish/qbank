import Button from "../../components/common/Button.jsx";
import Icon from "../../components/common/Icon.jsx";

function ShareQuestionToolbar({
  isShareDisabled = false,
  onClearSelection,
  onSelectAllVisible,
  onShareSelected,
  selectedCount = 0,
  totalVisibleCount = 0,
  visibleSelectedCount = 0,
}) {
  const hasVisibleQuestions = totalVisibleCount > 0;
  const areAllVisibleSelected =
    hasVisibleQuestions && visibleSelectedCount === totalVisibleCount;

  return (
    <div className="share-question-toolbar">
      <div className="share-question-toolbar__summary">
        <strong>{selectedCount}</strong>
        <span>selected</span>
      </div>

      <div className="share-question-toolbar__actions">
        <Button
          disabled={!hasVisibleQuestions}
          onClick={() => onSelectAllVisible(!areAllVisibleSelected)}
          variant="secondary"
        >
          {areAllVisibleSelected ? "Unselect Visible" : "Select All Visible"}
        </Button>
        <Button
          disabled={selectedCount === 0}
          onClick={onClearSelection}
          variant="secondary"
        >
          Clear
        </Button>
        <Button
          disabled={selectedCount === 0 || isShareDisabled}
          onClick={onShareSelected}
        >
          <Icon name="link" size={18} />
          <span>Share Selected</span>
        </Button>
      </div>
    </div>
  );
}

export default ShareQuestionToolbar;
