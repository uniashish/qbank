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

function getSaveErrorMessage(saveStatus) {
  const errorMessage = String(saveStatus.error ?? "").trim();

  return errorMessage || "Draft could not be saved. Try again.";
}

function PaperSaveStatus({ saveStatus }) {
  const showError = saveStatus.state === "save-failed";

  return (
    <div
      className={[
        "paper-save-status",
        `paper-save-status--${saveStatus.state}`,
      ].join(" ")}
      role="status"
    >
      <span aria-hidden="true" />
      <div className="paper-save-status__copy">
        <p>{getStatusCopy(saveStatus)}</p>
        {showError && (
          <p className="paper-save-status__error">
            {getSaveErrorMessage(saveStatus)}
          </p>
        )}
      </div>
    </div>
  );
}

export default PaperSaveStatus;
