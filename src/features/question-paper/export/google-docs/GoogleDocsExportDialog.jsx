import { useCallback, useEffect, useRef, useState } from "react";

import Button from "../../../../components/common/Button.jsx";
import {
  ANSWER_KEY_MODES,
  normalizeAnswerKeyOptions,
} from "../../answer-key/answerKeyGenerator.js";

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
    label: "Separate document",
    mode: ANSWER_KEY_MODES.SEPARATE,
  },
];

function GoogleDocsExportDialog({
  createdDocs = [],
  error = "",
  isExporting = false,
  isOpen,
  onClose,
  onExport,
  paper,
}) {
  const dialogRef = useRef(null);
  const [answerKeyMode, setAnswerKeyMode] = useState(ANSWER_KEY_MODES.NONE);
  const hasCreatedDocs = createdDocs.length > 0;
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
    });
  }

  return (
    <div className="export-paper-layer">
      <button
        aria-label="Close Google Docs export dialog"
        className="export-paper-backdrop"
        disabled={isExporting}
        onClick={handleClose}
        type="button"
      />
      <form
        aria-labelledby="google-docs-export-title"
        aria-modal="true"
        className="export-paper-dialog"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="export-paper-dialog__header">
          <div>
            <p className="question-papers-header__eyebrow">Google Docs Export</p>
            <h2 id="google-docs-export-title">
              {paper?.title || "Question Paper"}
            </h2>
          </div>
        </header>

        <div className="export-paper-dialog__fields">
          <label className="export-paper-dialog__field">
            <span>Format</span>
            <select className="input" disabled value="google-docs">
              <option value="google-docs">Google Docs</option>
            </select>
          </label>

          <fieldset className="export-paper-options">
            <legend>Answer Key</legend>
            <div className="export-paper-options__choices">
              {ANSWER_KEY_OPTIONS.map((option) => (
                <label key={option.mode}>
                  <input
                    checked={answerKeyMode === option.mode}
                    disabled={isExporting || hasCreatedDocs}
                    name="google-docs-answer-key-mode"
                    onChange={() => setAnswerKeyMode(option.mode)}
                    type="radio"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        {hasCreatedDocs && (
          <section className="export-paper-dialog__success" role="status">
            <h3>Question Paper created successfully.</h3>
            <div className="export-paper-dialog__links">
              {createdDocs.map((doc) => (
                <a
                  href={doc.url}
                  key={doc.id || doc.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {doc.title || "Open Google Doc"}
                </a>
              ))}
            </div>
          </section>
        )}

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
            {hasCreatedDocs ? "Close" : "Cancel"}
          </Button>
          {!hasCreatedDocs && (
            <Button isLoading={isExporting} type="submit">
              Create Google Doc
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

export default GoogleDocsExportDialog;
