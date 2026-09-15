import { ACADEMIC_STATUSES } from "../../constants/academicStatus.js";
import { formatDate } from "../../utils/formatDate.js";
import StatusBadge from "./StatusBadge.jsx";

function getNextStatus(status) {
  return status === ACADEMIC_STATUSES.ACTIVE
    ? ACADEMIC_STATUSES.INACTIVE
    : ACADEMIC_STATUSES.ACTIVE;
}

function getStatusActionLabel(status) {
  return status === ACADEMIC_STATUSES.ACTIVE ? "Deactivate" : "Activate";
}

function ClassesList({
  classes,
  isUpdatingStatus = false,
  onCancelStatusChange,
  onConfirmStatusChange,
  onEdit,
  onRequestStatusChange,
  pendingStatusChange,
}) {
  return (
    <section className="academic-table-card" aria-labelledby="classes-list-title">
      <div className="academic-section-header">
        <div>
          <h2 id="classes-list-title">Classes</h2>
          <p>School classes available for question bank setup.</p>
        </div>
        <span>{classes.length}</span>
      </div>

      <table className="academic-table">
        <thead>
          <tr>
            <th scope="col">Class</th>
            <th scope="col">Code</th>
            <th scope="col">Status</th>
            <th scope="col">Updated</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {classes.map((classRecord) => {
            const nextStatus = getNextStatus(classRecord.status);
            const isPending = pendingStatusChange?.id === classRecord.id;

            return (
              <tr key={classRecord.id}>
                <td data-label="Class">
                  <div className="academic-table__identity">
                    <strong>{classRecord.name}</strong>
                    <span>{classRecord.id}</span>
                  </div>
                </td>
                <td data-label="Code">{classRecord.code}</td>
                <td data-label="Status">
                  <StatusBadge status={classRecord.status} />
                </td>
                <td data-label="Updated">{formatDate(classRecord.updatedAt)}</td>
                <td data-label="Actions">
                  {isPending ? (
                    <div className="academic-inline-confirmation">
                      <p>Deactivate this class?</p>
                      <div>
                        <button
                          className="link-button link-button--primary"
                          disabled={isUpdatingStatus}
                          onClick={onConfirmStatusChange}
                          type="button"
                        >
                          {isUpdatingStatus ? "Updating..." : "Confirm"}
                        </button>
                        <button
                          className="link-button link-button--secondary"
                          disabled={isUpdatingStatus}
                          onClick={onCancelStatusChange}
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="academic-actions">
                      <button
                        className="link-button link-button--secondary"
                        onClick={() => onEdit(classRecord)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="link-button link-button--secondary"
                        onClick={() =>
                          onRequestStatusChange(classRecord, nextStatus)
                        }
                        type="button"
                      >
                        {getStatusActionLabel(classRecord.status)}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default ClassesList;
