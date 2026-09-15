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

function SubjectsList({
  isUpdatingStatus = false,
  onCancelStatusChange,
  onConfirmStatusChange,
  onEdit,
  onRequestStatusChange,
  pendingStatusChange,
  subjects,
}) {
  return (
    <section className="academic-table-card" aria-labelledby="subjects-list-title">
      <div className="academic-section-header">
        <div>
          <h2 id="subjects-list-title">Subjects</h2>
          <p>Subjects are created once and mapped to one or more classes.</p>
        </div>
        <span>{subjects.length}</span>
      </div>

      <table className="academic-table">
        <thead>
          <tr>
            <th scope="col">Subject</th>
            <th scope="col">Code</th>
            <th scope="col">Status</th>
            <th scope="col">Updated</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subject) => {
            const nextStatus = getNextStatus(subject.status);
            const isPending = pendingStatusChange?.id === subject.id;

            return (
              <tr key={subject.id}>
                <td data-label="Subject">
                  <div className="academic-table__identity">
                    <strong>{subject.name}</strong>
                    <span>{subject.id}</span>
                  </div>
                </td>
                <td data-label="Code">{subject.code}</td>
                <td data-label="Status">
                  <StatusBadge status={subject.status} />
                </td>
                <td data-label="Updated">{formatDate(subject.updatedAt)}</td>
                <td data-label="Actions">
                  {isPending ? (
                    <div className="academic-inline-confirmation">
                      <p>Deactivate this subject?</p>
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
                        onClick={() => onEdit(subject)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="link-button link-button--secondary"
                        onClick={() => onRequestStatusChange(subject, nextStatus)}
                        type="button"
                      >
                        {getStatusActionLabel(subject.status)}
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

export default SubjectsList;
