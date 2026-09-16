import { useEffect, useRef, useState } from "react";

import Button from "../../components/common/Button.jsx";
import Icon from "../../components/common/Icon.jsx";
import TeacherMultiSelect from "./TeacherMultiSelect.jsx";

function ShareQuestionsDialog({
  isOpen = false,
  isSharing = false,
  onClose,
  onRevokeShares,
  onShare,
  revokingTeacherId = "",
  selectedQuestionCount = 0,
  shareStateByTeacherId,
  teachers = [],
}) {
  const dialogRef = useRef(null);
  const [dialogError, setDialogError] = useState("");
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);
  const isBusy = isSharing || Boolean(revokingTeacherId);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isBusy, isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  async function handleShare() {
    if (selectedTeacherIds.length === 0) {
      setDialogError("Choose at least one teacher before sharing.");
      return;
    }

    setDialogError("");

    try {
      await onShare(selectedTeacherIds);
    } catch (error) {
      setDialogError(error?.message || "Questions could not be shared.");
    }
  }

  async function handleRevokeShares(teacherId, shareIds) {
    setDialogError("");

    try {
      await onRevokeShares(teacherId, shareIds);
    } catch (error) {
      setDialogError(error?.message || "Shared access could not be revoked.");
    }
  }

  return (
    <div className="question-designer-overlay" role="presentation">
      <button
        aria-label="Close share questions dialog"
        className="question-designer-backdrop"
        disabled={isBusy}
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-labelledby="share-questions-title"
        aria-modal="true"
        className="share-questions-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="share-questions-dialog__header">
          <div>
            <p className="question-designer-header__eyebrow">Share Questions</p>
            <h2 id="share-questions-title">Choose Teachers</h2>
            <p>
              {selectedQuestionCount} selected question
              {selectedQuestionCount === 1 ? "" : "s"}
            </p>
          </div>
          <button
            aria-label="Close share questions dialog"
            className="icon-button"
            disabled={isBusy}
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </header>

        <div className="share-questions-dialog__body">
          {dialogError && (
            <div className="teacher-question-bank-feedback teacher-question-bank-feedback--error">
              {dialogError}
            </div>
          )}

          <TeacherMultiSelect
            disabled={isBusy}
            onRevokeShares={handleRevokeShares}
            onSelectionChange={setSelectedTeacherIds}
            revokingTeacherId={revokingTeacherId}
            selectedQuestionCount={selectedQuestionCount}
            selectedTeacherIds={selectedTeacherIds}
            shareStateByTeacherId={shareStateByTeacherId}
            teachers={teachers}
          />
        </div>

        <footer className="share-questions-dialog__actions">
          <Button disabled={isBusy} onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button
            disabled={selectedTeacherIds.length === 0}
            isLoading={isSharing}
            onClick={handleShare}
          >
            Share
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default ShareQuestionsDialog;
