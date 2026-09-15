import {
  ACCOUNT_STATUSES,
} from "../../constants/userStatus.js";

const TEACHER_STATUS_LABELS = {
  [ACCOUNT_STATUSES.ACTIVE]: "Active",
  [ACCOUNT_STATUSES.DISABLED]: "Disabled",
  [ACCOUNT_STATUSES.INVITED]: "Invited",
};

function TeacherStatusBadge({ status }) {
  const label = TEACHER_STATUS_LABELS[status] ?? "Unknown";
  const variant =
    status === ACCOUNT_STATUSES.ACTIVE || status === ACCOUNT_STATUSES.DISABLED
      ? status
      : ACCOUNT_STATUSES.INVITED;

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
