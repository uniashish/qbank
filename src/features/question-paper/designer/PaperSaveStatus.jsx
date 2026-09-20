function formatSavedAt(savedAt) {
  if (!savedAt) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(savedAt);
}

function getStatusCopy(saveStatus) {
  if (saveStatus.state === "saving") {
    return "Saving...";
  }

  if (saveStatus.state === "saved") {
    const savedAt = formatSavedAt(saveStatus.savedAt);

    return savedAt ? `Saved ${savedAt}` : "Saved";
  }

  if (saveStatus.state === "save-failed") {
    return "Save failed";
  }

  return "Unsaved changes";
}

function PaperSaveStatus({ saveStatus }) {
  return (
    <div
      className={[
        "paper-save-status",
        `paper-save-status--${saveStatus.state}`,
      ].join(" ")}
      role="status"
    >
      <span aria-hidden="true" />
      <p>{getStatusCopy(saveStatus)}</p>
    </div>
  );
}

export default PaperSaveStatus;
