import { useEffect, useRef } from "react";

import Button from "../common/Button.jsx";
import Icon from "../common/Icon.jsx";

function DeleteQuestionDialog({
  error = "",
  isDeleting = false,
  onCancel,
  onConfirm,
  question,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!question) {
      return undefined;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDeleting, onCancel, question]);

  if (!question) {
    return null;
  }

  return (
    <div className="question-designer-overlay" role="presentation">
      <button
        aria-label="Cancel question deletion"
        className="question-designer-backdrop"
        disabled={isDeleting}
        onClick={onCancel}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-describedby="delete-question-description"
        aria-labelledby="delete-question-title"
        aria-modal="true"
        className="delete-question-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="delete-question-dialog__header">
          <span aria-hidden="true">
            <Icon name="trash" size={22} />
          </span>
          <div>
            <h2 id="delete-question-title">Delete Question</h2>
            <p id="delete-question-description">
              This question will be hidden from your active question bank.
            </p>
          </div>
        </header>

        <p className="delete-question-dialog__prompt">{question.prompt}</p>

        {error && (
          <div className="teacher-question-bank-feedback teacher-question-bank-feedback--error" role="alert">
            {error}
          </div>
        )}

        <footer className="delete-question-dialog__actions">
          <Button disabled={isDeleting} onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button
            className="delete-question-dialog__confirm"
            isLoading={isDeleting}
            onClick={onConfirm}
          >
            Delete Question
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default DeleteQuestionDialog;
