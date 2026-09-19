function TagChip({
  className = "",
  label,
  onRemove,
  readOnly = false,
  title,
}) {
  const tagLabel = String(label ?? "").trim();
  const canRemove = !readOnly && typeof onRemove === "function";

  if (!tagLabel) {
    return null;
  }

  return (
    <span
      className={["tag-chip", canRemove ? "tag-chip--removable" : "", className]
        .filter(Boolean)
        .join(" ")}
      title={title ?? tagLabel}
    >
      <span className="tag-chip__label">{tagLabel}</span>
      {canRemove && (
        <button
          aria-label={`Remove tag ${tagLabel}`}
          className="tag-chip__remove"
          onClick={() => onRemove(tagLabel)}
          type="button"
        >
          &times;
        </button>
      )}
    </span>
  );
}

export default TagChip;
