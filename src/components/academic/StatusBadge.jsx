import {
  ACADEMIC_STATUSES,
  ACADEMIC_STATUS_LABELS,
} from "../../constants/academicStatus.js";

function StatusBadge({ status }) {
  const normalizedStatus =
    status === ACADEMIC_STATUSES.INACTIVE
      ? ACADEMIC_STATUSES.INACTIVE
      : ACADEMIC_STATUSES.ACTIVE;

  return (
    <span className={`academic-status academic-status--${normalizedStatus}`}>
      <span aria-hidden="true" />
      {ACADEMIC_STATUS_LABELS[normalizedStatus]}
    </span>
  );
}

export default StatusBadge;
