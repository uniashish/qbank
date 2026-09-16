import { useCallback, useEffect, useRef, useState } from "react";

const MIN_TABLE_SIZE = 1;
const MAX_TABLE_SIZE = 12;

function clampTableSize(value) {
  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) {
    return MIN_TABLE_SIZE;
  }

  return Math.min(MAX_TABLE_SIZE, Math.max(MIN_TABLE_SIZE, numberValue));
}

function InsertTableDialog({ isOpen, onClose, onInsert }) {
  const [columns, setColumns] = useState(4);
  const [rows, setRows] = useState(3);
  const dialogRef = useRef(null);

  const resetDialog = useCallback(() => {
    setRows(3);
    setColumns(4);
  }, []);

  const handleClose = useCallback(() => {
    resetDialog();
    onClose();
  }, [onClose, resetDialog]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      onInsert({
        columns: clampTableSize(columns),
        rows: clampTableSize(rows),
      });
      resetDialog();
      onClose();
    },
    [columns, onClose, onInsert, resetDialog, rows],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div className="rich-text-editor-dialog-layer" role="presentation">
      <button
        aria-label="Close insert table dialog"
        className="rich-text-editor-dialog-backdrop"
        onClick={handleClose}
        tabIndex={-1}
        type="button"
      />
      <form
        aria-describedby="insert-table-description"
        aria-labelledby="insert-table-title"
        aria-modal="true"
        className="rich-text-editor-dialog rich-text-editor-dialog--compact"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="rich-text-editor-dialog__header">
          <div>
            <h2 id="insert-table-title">Insert Table</h2>
            <p id="insert-table-description">
              Choose the starting number of rows and columns.
            </p>
          </div>
          <button
            aria-label="Close insert table dialog"
            className="rich-text-editor-dialog__close"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <div className="rich-text-editor-dialog__grid">
          <label className="rich-text-editor-dialog__field" htmlFor="insert-table-rows">
            <span>Rows</span>
            <input
              id="insert-table-rows"
              max={MAX_TABLE_SIZE}
              min={MIN_TABLE_SIZE}
              onChange={(event) => setRows(event.target.value)}
              type="number"
              value={rows}
            />
          </label>
          <label className="rich-text-editor-dialog__field" htmlFor="insert-table-columns">
            <span>Columns</span>
            <input
              id="insert-table-columns"
              max={MAX_TABLE_SIZE}
              min={MIN_TABLE_SIZE}
              onChange={(event) => setColumns(event.target.value)}
              type="number"
              value={columns}
            />
          </label>
        </div>

        <div className="rich-text-editor-dialog__actions">
          <button
            className="rich-text-editor-dialog__button rich-text-editor-dialog__button--secondary"
            onClick={handleClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rich-text-editor-dialog__button rich-text-editor-dialog__button--primary"
            type="submit"
          >
            Insert Table
          </button>
        </div>
      </form>
    </div>
  );
}

export default InsertTableDialog;
