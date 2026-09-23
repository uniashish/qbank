import {
  ACCOUNT_STATUSES,
} from "../../constants/userStatus.js";

const TEACHER_STATUS_LABELS = {
  [ACCOUNT_STATUSES.ACTIVE]: "Active",
  [ACCOUNT_STATUSES.DISABLED]: "Disabled",
  [ACCOUNT_STATUSES.PENDING_APPROVAL]: "Pending Approval",
};

function TeacherStatusBadge({ status }) {
  const label = TEACHER_STATUS_LABELS[status] ?? "Unknown";
  const variant = Object.hasOwn(TEACHER_STATUS_LABELS, status)
    ? status
    : "unknown";

  return (
    <span
      aria-label={`Teacher status: ${label}`}
      className={`teacher-status-badge teacher-status-badge--${variant}`}
    >
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export default TeacherStatusBadge;
