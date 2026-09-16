import { useCallback, useEffect, useRef, useState } from "react";

import {
  ACCEPTED_RICH_TEXT_IMAGE_INPUT,
  validateRichTextImageFile,
} from "../editorExtensions.js";

const INITIAL_STATE = {
  altText: "",
  error: "",
  fileName: "",
  previewUrl: "",
};

function InsertImageDialog({ isOpen, onClose, onInsert }) {
  const [dialogState, setDialogState] = useState(INITIAL_STATE);
  const dialogRef = useRef(null);
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef("");

  const revokePreviewUrl = useCallback(() => {
    if (!previewUrlRef.current) {
      return;
    }

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = "";
  }, []);

  const resetDialog = useCallback(() => {
    revokePreviewUrl();
    setDialogState(INITIAL_STATE);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [revokePreviewUrl]);

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

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, [revokePreviewUrl]);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files?.[0];
      const validationError = validateRichTextImageFile(file);

      revokePreviewUrl();

      if (validationError) {
        setDialogState({
          ...INITIAL_STATE,
          error: validationError,
        });
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      previewUrlRef.current = previewUrl;

      setDialogState({
        altText: "",
        error: "",
        fileName: file.name,
        previewUrl,
      });
    },
    [revokePreviewUrl],
  );

  const handleAltTextChange = useCallback((event) => {
    setDialogState((currentState) => ({
      ...currentState,
      altText: event.target.value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!dialogState.previewUrl) {
        setDialogState((currentState) => ({
          ...currentState,
          error: "Choose an image file.",
        }));
        return;
      }

      const altText = dialogState.altText.trim() || dialogState.fileName;
      onInsert({
        alt: altText,
        src: dialogState.previewUrl,
        title: dialogState.fileName,
      });

      previewUrlRef.current = "";
      setDialogState(INITIAL_STATE);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
    },
    [dialogState, onClose, onInsert],
  );

  if (!isOpen) {
    return null;
  }

  const errorId = dialogState.error ? "insert-image-error" : undefined;

  return (
    <div className="rich-text-editor-dialog-layer" role="presentation">
      <button
        aria-label="Close insert image dialog"
        className="rich-text-editor-dialog-backdrop"
        onClick={handleClose}
        tabIndex={-1}
        type="button"
      />
      <form
        aria-describedby="insert-image-description"
        aria-labelledby="insert-image-title"
        aria-modal="true"
        className="rich-text-editor-dialog"
        onSubmit={handleSubmit}
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <div className="rich-text-editor-dialog__header">
          <div>
            <h2 id="insert-image-title">Insert Image</h2>
            <p id="insert-image-description">
              Choose a local JPEG, PNG or WEBP image up to 5 MB.
            </p>
          </div>
          <button
            aria-label="Close insert image dialog"
            className="rich-text-editor-dialog__close"
            onClick={handleClose}
            type="button"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <label className="rich-text-editor-dialog__field" htmlFor="insert-image-file">
          <span>Image file</span>
          <input
            accept={ACCEPTED_RICH_TEXT_IMAGE_INPUT}
            aria-describedby={errorId}
            id="insert-image-file"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
        </label>

        {dialogState.previewUrl && (
          <figure className="rich-text-editor-dialog__image-preview">
            <img alt="" src={dialogState.previewUrl} />
            <figcaption>{dialogState.fileName}</figcaption>
          </figure>
        )}

        <label className="rich-text-editor-dialog__field" htmlFor="insert-image-alt">
          <span>Alt text</span>
          <input
            id="insert-image-alt"
            onChange={handleAltTextChange}
            placeholder="Describe the image"
            type="text"
            value={dialogState.altText}
          />
        </label>

        {dialogState.error && (
          <p className="rich-text-editor-dialog__error" id="insert-image-error" role="alert">
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
            disabled={!dialogState.previewUrl}
            type="submit"
          >
            Insert Image
          </button>
        </div>
      </form>
    </div>
  );
}

export default InsertImageDialog;
