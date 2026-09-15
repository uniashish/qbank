import {
  SCHOOL_STATUSES,
  SCHOOL_STATUS_LABELS,
} from "../../constants/schoolStatus.js";

function SchoolStatusBadge({ status }) {
  const label = SCHOOL_STATUS_LABELS[status] ?? "Unknown";
  const variant = status === SCHOOL_STATUSES.ACTIVE ? "active" : "inactive";

  return (
    <span
      aria-label={`School status: ${label}`}
      className={`school-status-badge school-status-badge--${variant}`}
    >
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export default SchoolStatusBadge;
