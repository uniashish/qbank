import { useCallback, useEffect, useRef, useState } from "react";

import Button from "../../../components/common/Button.jsx";
import {
  ANSWER_KEY_MODES,
  normalizeAnswerKeyOptions,
} from "../answer-key/answerKeyGenerator.js";

const ANSWER_KEY_OPTIONS = [
  {
    label: "None",
    mode: ANSWER_KEY_MODES.NONE,
  },
  {
    label: "Append to paper",
    mode: ANSWER_KEY_MODES.APPEND,
  },
  {
    label: "Separate file",
    mode: ANSWER_KEY_MODES.SEPARATE,
  },
];

function ExportPaperDialog({
  error = "",
  isExporting = false,
  isOpen,
  onClose,
  onExport,
  paper,
}) {
  const dialogRef = useRef(null);
  const [answerKeyMode, setAnswerKeyMode] = useState(ANSWER_KEY_MODES.NONE);
  const handleClose = useCallback(() => {
    if (!isExporting) {
      onClose?.();
    }
  }, [isExporting, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();

    onExport?.({
      answerKeyOptions: normalizeAnswerKeyOptions({ mode: answerKeyMode }),
      format: "pdf",
      pageSize: "A4",
    });
  }

  return (
    <div className="export-paper-layer">
      <button
        aria-label="Close export dialog"
        className="export-paper-backdrop"
        disabled={isExporting}
        onClick={handleClose}
        type="button"
      />
      <form
        aria-labelledby="export-paper-title"
        aria-modal="true"
        className="export-paper-dialog"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="export-paper-dialog__header">
          <div>
            <p className="question-papers-header__eyebrow">Export</p>
            <h2 id="export-paper-title">{paper?.title || "Question Paper"}</h2>
          </div>
        </header>

        <div className="export-paper-dialog__fields">
          <label className="export-paper-dialog__field">
            <span>Format</span>
            <select className="input" disabled value="pdf">
              <option value="pdf">PDF</option>
            </select>
          </label>

          <fieldset className="export-paper-options">
            <legend>Answer Key</legend>
            <div className="export-paper-options__choices">
              {ANSWER_KEY_OPTIONS.map((option) => (
                <label key={option.mode}>
                  <input
                    checked={answerKeyMode === option.mode}
                    disabled={isExporting}
                    name="export-answer-key-mode"
                    onChange={() => setAnswerKeyMode(option.mode)}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="export-paper-dialog__field">
            <span>Page Size</span>
            <select className="input" disabled value="A4">
              <option value="A4">A4</option>
            </select>
          </label>
        </div>

        {error && (
          <div className="export-paper-dialog__error" role="alert">
            {error}
          </div>
        )}

        <div className="export-paper-dialog__actions">
          <Button
            disabled={isExporting}
            onClick={handleClose}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button isLoading={isExporting} type="submit">
            Export PDF
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ExportPaperDialog;
