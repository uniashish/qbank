const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp";

function ImageDropZone({
  describedBy,
  inputId,
  inputRef,
  isDragging = false,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileChange,
  onOpenFilePicker,
}) {
  const dropZoneClasses = [
    "question-image-dropzone",
    isDragging ? "question-image-dropzone--dragging" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <input
        accept={ACCEPTED_IMAGE_TYPES}
        aria-describedby={describedBy}
        className="question-image-picker__input"
        id={inputId}
        onChange={onFileChange}
        ref={inputRef}
        type="file"
      />
      <button
        aria-describedby={describedBy}
        className={dropZoneClasses}
        onClick={onOpenFilePicker}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        type="button"
      >
        <span className="question-image-dropzone__primary">
          Drag an image here
        </span>
        <span className="question-image-dropzone__secondary">or</span>
        <span className="question-image-dropzone__action">Choose Image</span>
        <span className="question-image-dropzone__hint">
          JPEG, PNG or WEBP - Max 5 MB
        </span>
      </button>
    </>
  );
}

export default ImageDropZone;
