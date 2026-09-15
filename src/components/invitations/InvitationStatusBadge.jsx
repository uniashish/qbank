import {
  INVITATION_STATUSES,
  INVITATION_STATUS_LABELS,
} from "../../constants/invitationStatus.js";

function InvitationStatusBadge({ status }) {
  const label = INVITATION_STATUS_LABELS[status] ?? "Unknown";
  const variant = Object.values(INVITATION_STATUSES).includes(status)
    ? status
    : INVITATION_STATUSES.PENDING;

  return (
    <span
      aria-label={`Invitation status: ${label}`}
      className={`invitation-status-badge invitation-status-badge--${variant}`}
    >
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export default InvitationStatusBadge;
