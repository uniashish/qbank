import { useCallback, useRef, useState } from "react";

import FormField from "../../../../components/common/FormField.jsx";
import ImageDropZone from "./ImageDropZone.jsx";
import ImagePreview from "./ImagePreview.jsx";

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

function validateImageFile(file) {
  if (!file) {
    return "Choose an image file.";
  }

  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    return "Use a JPEG, PNG or WEBP image.";
  }

  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }

  return "";
}

function QuestionImagePicker({
  image = {},
  inputId = "question-image",
  onChange,
  onError,
  onRemove,
}) {
  const inputRef = useRef(null);
  const [fallbackError, setFallbackError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const error = image.error || fallbackError;
  const describedBy = error ? `${inputId}-error` : undefined;
  const hasImage = Boolean(image.previewUrl || image.downloadUrl);

  const setError = useCallback(
    (errorMessage) => {
      setFallbackError(errorMessage);
      onError?.(errorMessage);
    },
    [onError],
  );

  const handleOpenFilePicker = useCallback(() => {
    if (error) {
      setError("");
    }

    inputRef.current?.click();
  }, [error, setError]);

  const handleFile = useCallback(
    (file) => {
      const validationError = validateImageFile(file);

      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      onChange?.(file);
    },
    [onChange, setError],
  );

  const handleFileChange = useCallback(
    (event) => {
      handleFile(event.target.files?.[0]);
      event.target.value = "";
    },
    [handleFile],
  );

  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      handleFile(event.dataTransfer.files?.[0]);
    },
    [handleFile],
  );

  const handleRemove = useCallback(() => {
    setError("");
    onRemove();
  }, [onRemove, setError]);

  return (
    <FormField
      error={error}
      htmlFor={inputId}
      label="Question Image (optional)"
    >
      {hasImage ? (
        <>
          <input
            accept={[...ACCEPTED_IMAGE_TYPES].join(",")}
            className="question-image-picker__input"
            id={inputId}
            onChange={handleFileChange}
            ref={inputRef}
            type="file"
          />
          <ImagePreview
            image={image}
            isLoading={Boolean(image.isLoading)}
            onRemove={handleRemove}
            onReplace={handleOpenFilePicker}
          />
        </>
      ) : (
        <ImageDropZone
          describedBy={describedBy}
          inputId={inputId}
          inputRef={inputRef}
          isDragging={isDragging}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
          onOpenFilePicker={handleOpenFilePicker}
        />
      )}
    </FormField>
  );
}

export default QuestionImagePicker;
