import { useCallback, useEffect, useRef } from "react";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function formatSummaryValue(value, fallback = "Not set") {
  if (value == null || value === "") {
    return fallback;
  }

  return value;
}

function FinalizationMessages({ messages = [], title, type }) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <section
      className={`finalize-paper-dialog__messages finalize-paper-dialog__messages--${type}`}
    >
      <div className="finalize-paper-dialog__messages-title">
        <Icon name="alert" size={18} />
        <h3>{title}</h3>
      </div>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  );
}

function FinalizePaperDialog({
  isFinalizing = false,
  isOpen,
  onClose,
  onConfirm,
  summary,
  validation,
}) {
  const dialogRef = useRef(null);
  const canFinalize = validation?.canFinalize && !isFinalizing;
  const handleClose = useCallback(() => {
    if (!isFinalizing) {
      onClose();
    }
  }, [isFinalizing, onClose]);

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

  return (
    <div className="finalize-paper-layer">
      <button
        aria-label="Close finalize paper dialog"
        className="finalize-paper-backdrop"
        disabled={isFinalizing}
        onClick={handleClose}
        type="button"
      />
      <section
        aria-labelledby="finalize-paper-title"
        aria-modal="true"
        className="finalize-paper-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="finalize-paper-dialog__header">
          <div>
            <h2 id="finalize-paper-title">Finalize this paper?</h2>
          </div>
        </header>

        <dl className="finalize-paper-dialog__summary">
          <div>
            <dt>Questions</dt>
            <dd>{formatSummaryValue(summary?.questionCount, 0)}</dd>
          </div>
          <div>
            <dt>Total Marks</dt>
            <dd>{formatSummaryValue(summary?.totalMarks, 0)}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>{formatSummaryValue(summary?.difficulty?.overallDifficulty)}</dd>
          </div>
        </dl>

        <div className="finalize-paper-dialog__copy">
          <p>After finalizing, this paper cannot be edited.</p>
          <p>You can create an editable copy later.</p>
        </div>

        <FinalizationMessages
          messages={validation?.warnings}
          title="Warning"
          type="warning"
        />
        <FinalizationMessages
          messages={validation?.errors}
          title="Fix before finalizing"
          type="error"
        />

        <footer className="finalize-paper-dialog__actions">
          <Button
            disabled={isFinalizing}
            onClick={handleClose}
            type="button"
            variant="secondary"
          >
            Cancel
          </Button>
          <Button
            disabled={!canFinalize}
            isLoading={isFinalizing}
            onClick={onConfirm}
            type="button"
          >
            Finalize
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default FinalizePaperDialog;
