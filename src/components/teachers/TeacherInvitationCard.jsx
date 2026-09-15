import { useState } from "react";

import { INVITATION_STATUSES } from "../../constants/invitationStatus.js";
import { formatDate } from "../../utils/formatDate.js";
import Button from "../common/Button.jsx";
import InvitationStatusBadge from "../invitations/InvitationStatusBadge.jsx";

function TeacherInvitationCard({
  invitation,
  invitationUrl,
  isCancelling = false,
  onCancel,
}) {
  const [copyFeedback, setCopyFeedback] = useState("");
  const isPending = invitation.status === INVITATION_STATUSES.PENDING;

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
    <article className="teacher-invitation-card">
      <div className="teacher-invitation-card__details">
        <div>
          <h3>{invitation.name}</h3>
          <p>{invitation.email}</p>
          <span>Created {formatDate(invitation.createdAt)}</span>
        </div>
        <InvitationStatusBadge status={invitation.status} />
      </div>

      {isPending && (
        <div className="teacher-invitation-card__pending">
          <input
            aria-label={`Invitation URL for ${invitation.email}`}
            className="input"
            readOnly
            value={invitationUrl}
          />
          {copyFeedback && <span>{copyFeedback}</span>}
          <div className="teacher-invitation-card__actions">
            <Button onClick={handleCopy}>Copy invite link</Button>
            <button
              className="link-button link-button--secondary"
              disabled={isCancelling}
              onClick={() => onCancel(invitation)}
              type="button"
            >
              {isCancelling ? "Cancelling..." : "Cancel invitation"}
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default TeacherInvitationCard;
