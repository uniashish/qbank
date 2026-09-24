import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import EquationEditorField from "./EquationEditorField.jsx";
import {
  EQUATION_TYPES,
  createEquationNodeContent,
  getEquationPreviewState,
  getInitialEquationDialogState,
  normalizeEquationType,
  validateEquationDialogInput,
} from "./equationDialogUtils.js";

function EquationDialog({ isOpen, onClose, onInsert }) {
  const [dialogState, setDialogState] = useState(
    getInitialEquationDialogState,
  );
  const dialogRef = useRef(null);
  const previewState = useMemo(
    () => getEquationPreviewState(dialogState),
    [dialogState],
  );

  const resetDialog = useCallback(() => {
    setDialogState(getInitialEquationDialogState());
  }, []);

  const handleClose = useCallback(() => {
    resetDialog();
    onClose();
  }, [onClose, resetDialog]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

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

  const handleTypeChange = useCallback((event) => {
    const type = normalizeEquationType(event.target.value);

    setDialogState((currentState) => ({
      ...currentState,
      error: "",
      type,
    }));
  }, []);

  const handleLatexChange = useCallback((latex) => {
    setDialogState((currentState) => ({
      ...currentState,
      error: "",
      latex,
    }));
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const validation = validateEquationDialogInput(dialogState);

      if (!validation.isValid) {
        setDialogState((currentState) => ({
          ...currentState,
          error: validation.error,
          latex: validation.latex,
          type: validation.type,
        }));
        return;
      }

      onInsert(
        createEquationNodeContent({
          latex: validation.latex,
          type: validation.type,
        }),
      );
      resetDialog();
      onClose();
    },
    [dialogState, onClose, onInsert, resetDialog],
  );

  if (!isOpen) {
    return null;
  }

  const errorId = dialogState.error ? "insert-equation-error" : undefined;
  const fieldDescriptionId = errorId || "insert-equation-description";
  const isInsertDisabled = !dialogState.latex.trim();

  return (
    <div className="rich-text-editor-dialog-layer" role="presentation">
      <button
        aria-label="Close insert equation dialog"
        className="rich-text-editor-dialog-backdrop"
        onClick={handleClose}
        tabIndex={-1}
        type="button"
      />
      <form
        aria-describedby="insert-equation-description"
        aria-labelledby="insert-equation-title"
        aria-modal="true"
        className="rich-text-editor-dialog rich-text-editor-dialog--compact rich-text-editor-equation-dialog"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="rich-text-editor-dialog__header">
          <div>
            <h2 id="insert-equation-title">Insert Equation</h2>
            <p id="insert-equation-description">
              Create an inline or block equation.
            </p>
          </div>
          <button
            aria-label="Close insert equation dialog"
            className="rich-text-editor-dialog__close"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <fieldset className="rich-text-editor-equation-dialog__type">
          <legend>Type</legend>
          <label>
            <input
              checked={dialogState.type === EQUATION_TYPES.INLINE}
              name="insert-equation-type"
              onChange={handleTypeChange}
              type="radio"
              value={EQUATION_TYPES.INLINE}
            />
            <span>Inline</span>
          </label>
          <label>
            <input
              checked={dialogState.type === EQUATION_TYPES.BLOCK}
              name="insert-equation-type"
              onChange={handleTypeChange}
              type="radio"
              value={EQUATION_TYPES.BLOCK}
            />
            <span>Block</span>
          </label>
        </fieldset>

        <label
          className="rich-text-editor-dialog__field rich-text-editor-equation-dialog__field"
          htmlFor="insert-equation-latex"
        >
          <span>Equation</span>
          <EquationEditorField
            ariaDescribedBy={fieldDescriptionId}
            autoFocus
            id="insert-equation-latex"
            onChange={handleLatexChange}
            value={dialogState.latex}
          />
        </label>

        <section
          aria-label="Live Preview"
          className={[
            "rich-text-editor-equation-preview",
            previewState.type === EQUATION_TYPES.BLOCK
              ? "rich-text-editor-equation-preview--block"
              : "rich-text-editor-equation-preview--inline",
          ].join(" ")}
        >
          <h3>Live Preview</h3>
          <div className="rich-text-editor-equation-preview__body">
            {previewState.isEmpty ? (
              <span className="rich-text-editor-equation-preview__empty">
                Enter an equation
              </span>
            ) : previewState.canRender ? (
              <span
                className="rich-text-editor-equation-preview__rendered"
                dangerouslySetInnerHTML={{ __html: previewState.html }}
              />
            ) : (
              <code className="rich-text-editor-equation-preview__fallback">
                {previewState.fallbackText}
              </code>
            )}
          </div>
        </section>

        {dialogState.error && (
          <p
            className="rich-text-editor-dialog__error"
            id="insert-equation-error"
            role="alert"
          >
            {dialogState.error}
          </p>
        )}

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
            disabled={isInsertDisabled}
            type="submit"
          >
            Insert
          </button>
        </div>
      </form>
    </div>
  );
}

export default EquationDialog;
