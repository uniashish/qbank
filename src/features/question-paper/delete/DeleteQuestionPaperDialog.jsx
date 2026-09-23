import { useEffect, useRef } from "react";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function DeleteQuestionPaperDialog({
  error = "",
  isDeleting = false,
  isOpen = false,
  onClose,
  onConfirm,
  paper,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !paper) {
      return undefined;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isDeleting) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, isOpen, onClose, paper]);

  if (!isOpen || !paper) {
    return null;
  }

  return (
    <div className="export-paper-layer">
      <button
        aria-label="Cancel paper deletion"
        className="export-paper-backdrop"
        disabled={isDeleting}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-describedby="delete-paper-description"
        aria-labelledby="delete-paper-title"
        aria-modal="true"
        className="export-paper-dialog delete-paper-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="delete-paper-dialog__header">
          <span aria-hidden="true">
            <Icon name="trash" size={22} />
          </span>
          <div>
            <h2 id="delete-paper-title">Delete Paper</h2>
            <p id="delete-paper-description">
              This will permanently remove this question paper.
            </p>
          </div>
        </header>

        <p className="delete-paper-dialog__paper-title">
          {paper.title || "Untitled paper"}
        </p>

        {error && (
          <div className="export-paper-dialog__error" role="alert">
            {error}
          </div>
        )}

        <footer className="export-paper-dialog__actions">
          <Button disabled={isDeleting} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            className="delete-paper-dialog__confirm"
            isLoading={isDeleting}
            onClick={onConfirm}
          >
            Delete Paper
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default DeleteQuestionPaperDialog;
