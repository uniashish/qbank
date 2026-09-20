import { useCallback, useEffect, useRef } from "react";

import Button from "../../../components/common/Button.jsx";
import AnswerKeyQuestion from "./AnswerKeyQuestion.jsx";
import {
  ANSWER_KEY_MODES,
  DEFAULT_ANSWER_KEY_OPTIONS,
  normalizeAnswerKeyOptions,
} from "./answerKeyGenerator.js";

const ANSWER_KEY_OPTION_LABELS = [
  {
    label: "Do not include",
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

function AnswerKeyPreview({
  answerKey = { entries: [], totalQuestions: 0 },
  isOpen,
  onClose,
  onOptionsChange,
  options = DEFAULT_ANSWER_KEY_OPTIONS,
}) {
  const dialogRef = useRef(null);
  const selectedOptions = normalizeAnswerKeyOptions(options);
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);
  const handleOptionsChange = useCallback(
    (mode) => {
      onOptionsChange?.(normalizeAnswerKeyOptions({ mode }));
    },
    [onOptionsChange],
  );

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
    <div className="answer-key-layer">
      <button
        aria-label="Close answer key preview"
        className="answer-key-backdrop"
        onClick={handleClose}
        type="button"
      />
      <section
        aria-labelledby="answer-key-preview-title"
        aria-modal="true"
        className="answer-key-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="answer-key-dialog__header">
          <div>
            <p className="question-papers-header__eyebrow">Answer Key</p>
            <h2 id="answer-key-preview-title">ANSWER KEY</h2>
          </div>
          <Button onClick={handleClose} type="button" variant="secondary">
            Close
          </Button>
        </header>

        <fieldset className="answer-key-options">
          <legend>Export preference</legend>
          <div className="answer-key-options__choices">
            {ANSWER_KEY_OPTION_LABELS.map((option) => (
              <label key={option.mode}>
                <input
                  checked={selectedOptions.mode === option.mode}
                  name="answer-key-mode"
                  onChange={() => handleOptionsChange(option.mode)}
                  type="radio"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="answer-key-dialog__body">
          {answerKey.entries.length > 0 ? (
            <div className="answer-key-preview">
              {answerKey.entries.map((entry) => (
                <AnswerKeyQuestion entry={entry} key={entry.blockId} />
              ))}
            </div>
          ) : (
            <p className="answer-key-empty">No questions in this paper yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default AnswerKeyPreview;
