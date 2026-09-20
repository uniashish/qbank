import Button from "../../../components/common/Button.jsx";

function QuestionSelectionTray({
  onAddToPaper,
  onClear,
  selectedCount,
  totalMarks,
}) {
  return (
    <section className="question-selection-tray" aria-label="Selected questions">
      <div className="question-selection-tray__summary">
        <p>Selected: {selectedCount} question{selectedCount === 1 ? "" : "s"}</p>
        <p>Total Marks: {totalMarks}</p>
      </div>
      <div className="question-selection-tray__actions">
        <Button
          disabled={selectedCount === 0}
          onClick={onClear}
          type="button"
          variant="secondary"
        >
          Clear
        </Button>
        <Button disabled={selectedCount === 0} onClick={onAddToPaper} type="button">
          Add to Paper
        </Button>
      </div>
    </section>
  );
}

export default QuestionSelectionTray;
