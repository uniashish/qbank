import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import EquationEditorField from "./EquationEditorField.jsx";
import EquationSymbolPalette from "./EquationSymbolPalette.jsx";
import {
  EQUATION_DIALOG_MODES,
  EQUATION_TYPES,
  createEquationNodeContent,
  getEquationPreviewState,
  getInitialEquationDialogState,
  normalizeEquationType,
  validateEquationDialogInput,
} from "./equationDialogUtils.js";

function normalizeActionResult(result, fallbackError) {
  if (result === false) {
    return {
      error: fallbackError,
      ok: false,
    };
  }

  if (result?.ok === false) {
    return {
      error: result.error || fallbackError,
      ok: false,
    };
  }

  return {
    error: "",
    ok: true,
  };
}

function getEquationDialogKey(request) {
  return [
    request?.mode || EQUATION_DIALOG_MODES.INSERT,
    request?.nodeType || "",
    Number.isInteger(request?.position) ? request.position : "",
    request?.latex || "",
  ].join("|");
}

function EquationDialogContent({ onClose, onDelete, onSave, request }) {
  const [dialogState, setDialogState] = useState(() =>
    getInitialEquationDialogState(request),
  );
  const dialogRef = useRef(null);
  const equationFieldRef = useRef(null);
  const isEditMode = request?.mode === EQUATION_DIALOG_MODES.EDIT;
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
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose]);

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

  const handlePaletteInsert = useCallback((item) => {
    const didInsert = equationFieldRef.current?.insertLatex?.(item.latex, {
      selectionMode: item.selectionMode || "placeholder",
    });

    if (!didInsert) {
      equationFieldRef.current?.focus?.();
      return;
    }

    setDialogState((currentState) => ({
      ...currentState,
      error: "",
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

      const content = createEquationNodeContent({
        latex: validation.latex,
        type: validation.type,
      });
      const result = normalizeActionResult(
        onSave?.({
          content,
          latex: validation.latex,
          mode: isEditMode
            ? EQUATION_DIALOG_MODES.EDIT
            : EQUATION_DIALOG_MODES.INSERT,
          nodeType: content.type,
          request,
          type: validation.type,
        }),
        "Unable to save this equation.",
      );

      if (!result.ok) {
        setDialogState((currentState) => ({
          ...currentState,
          error: result.error,
          latex: validation.latex,
          type: validation.type,
        }));
        return;
      }

      resetDialog();
      onClose();
    },
    [dialogState, isEditMode, onClose, onSave, request, resetDialog],
  );

  const handleDelete = useCallback(() => {
    if (!isEditMode || typeof onDelete !== "function") {
      return;
    }

    const result = normalizeActionResult(
      onDelete(request),
      "Unable to delete this equation.",
    );

    if (!result.ok) {
      setDialogState((currentState) => ({
        ...currentState,
        error: result.error,
      }));
      return;
    }

    resetDialog();
    onClose();
  }, [isEditMode, onClose, onDelete, request, resetDialog]);

  const title = isEditMode ? "Edit Equation" : "Insert Equation";
  const description = isEditMode
    ? "Update this inline or block equation."
    : "Create an inline or block equation.";
  const primaryActionLabel = isEditMode ? "Save" : "Insert";
  const closeLabel = isEditMode
    ? "Close edit equation dialog"
    : "Close insert equation dialog";
  const errorId = dialogState.error ? "equation-dialog-error" : undefined;
  const fieldDescriptionId = errorId || "equation-dialog-description";
  const isInsertDisabled = !dialogState.latex.trim();

  return (
    <div className="rich-text-editor-dialog-layer" role="presentation">
      <button
        aria-label={closeLabel}
        className="rich-text-editor-dialog-backdrop"
        onClick={handleClose}
        tabIndex={-1}
        type="button"
      />
      <form
        aria-describedby="equation-dialog-description"
        aria-labelledby="equation-dialog-title"
        aria-modal="true"
        className="rich-text-editor-dialog rich-text-editor-dialog--compact rich-text-editor-equation-dialog"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="rich-text-editor-dialog__header">
          <div>
            <h2 id="equation-dialog-title">{title}</h2>
            <p id="equation-dialog-description">{description}</p>
          </div>
          <button
            aria-label={closeLabel}
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
              name="equation-dialog-type"
              onChange={handleTypeChange}
              type="radio"
              value={EQUATION_TYPES.INLINE}
            />
            <span>Inline</span>
          </label>
          <label>
            <input
              checked={dialogState.type === EQUATION_TYPES.BLOCK}
              name="equation-dialog-type"
              onChange={handleTypeChange}
              type="radio"
              value={EQUATION_TYPES.BLOCK}
            />
            <span>Block</span>
          </label>
        </fieldset>

        <label
          className="rich-text-editor-dialog__field rich-text-editor-equation-dialog__field"
          htmlFor="equation-dialog-latex"
        >
          <span>Equation</span>
          <EquationEditorField
            ariaDescribedBy={fieldDescriptionId}
            autoFocus
            id="equation-dialog-latex"
            onChange={handleLatexChange}
            ref={equationFieldRef}
            value={dialogState.latex}
          />
        </label>

        <EquationSymbolPalette onInsert={handlePaletteInsert} />

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
            id="equation-dialog-error"
            role="alert"
          >
            {dialogState.error}
          </p>
        )}

        <div className="rich-text-editor-dialog__actions">
          {isEditMode && (
            <button
              className="rich-text-editor-dialog__button rich-text-editor-dialog__button--danger rich-text-editor-equation-dialog__delete"
              onClick={handleDelete}
              type="button"
            >
              Delete Equation
            </button>
          )}
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
            {primaryActionLabel}
          </button>
        </div>
      </form>
    </div>
  );
}

function EquationDialog({ isOpen, onClose, onDelete, onSave, request }) {
  if (!isOpen) {
    return null;
  }

  return (
    <EquationDialogContent
      key={getEquationDialogKey(request)}
      onClose={onClose}
      onDelete={onDelete}
      onSave={onSave}
      request={request}
    />
  );
}

export default EquationDialog;
