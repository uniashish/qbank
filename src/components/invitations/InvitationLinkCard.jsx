import { useState } from "react";

import Button from "../common/Button.jsx";

function InvitationLinkCard({
  invitationUrl,
  isCancelling = false,
  onCancel,
  recipientLabel = "School Admin",
}) {
  const [copyFeedback, setCopyFeedback] = useState("");

  const handleCopy = async () => {
    setCopyFeedback("");

    try {
      await navigator.clipboard.writeText(invitationUrl);
      setCopyFeedback("Invite link copied.");
    } catch {
      setCopyFeedback("Copy failed. Select and copy the link manually.");
    }
  };

  return (
    <section className="invitation-link-card">
      <div className="invitation-link-card__content">
        <h2>Invite link</h2>
        <p>Share this link with the invited {recipientLabel}.</p>
        <input
          aria-label="Invitation URL"
          className="input"
          readOnly
          value={invitationUrl}
        />
        {copyFeedback && <span>{copyFeedback}</span>}
      </div>
      <div className="invitation-link-card__actions">
        <Button onClick={handleCopy}>Copy invite link</Button>
        {onCancel && (
          <button
            className="link-button link-button--secondary"
            disabled={isCancelling}
            onClick={onCancel}
            type="button"
          >
            {isCancelling ? "Cancelling..." : "Cancel invitation"}
          </button>
        )}
      </div>
    </section>
  );
}

export default InvitationLinkCard;
