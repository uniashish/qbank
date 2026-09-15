import Button from "../../../../components/common/Button.jsx";

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes)) {
    return "";
  }

  const megabytes = bytes / (1024 * 1024);

  return `${megabytes.toFixed(megabytes >= 1 ? 1 : 2)} MB`;
}

function ImagePreview({
  alt = "Selected question image preview",
  image,
  isLoading = false,
  onRemove,
  onReplace,
}) {
  const previewSource = image.previewUrl ?? image.downloadUrl;
  const hasActions = Boolean(onReplace || onRemove);
  const fileMeta = [
    image.file?.name,
    image.file ? formatFileSize(image.file.size) : "",
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className="question-image-preview">
      <div className="question-image-preview__frame">
        {previewSource ? (
          <img alt={alt} src={previewSource} />
        ) : (
          <span>Image preview unavailable</span>
        )}
      </div>

      <div className="question-image-preview__details">
        {fileMeta && (
          <p className="question-image-preview__meta">{fileMeta}</p>
        )}
        {isLoading && (
          <p className="question-image-preview__status">Preparing image...</p>
        )}

        {hasActions && (
          <div className="question-image-preview__actions">
            {onReplace && (
              <Button
                disabled={isLoading}
                onClick={onReplace}
                variant="secondary"
              >
                Replace Image
              </Button>
            )}
            {onRemove && (
              <Button
                disabled={isLoading}
                onClick={onRemove}
                variant="secondary"
              >
                Remove
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ImagePreview;
