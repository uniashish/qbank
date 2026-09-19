import { formatDate } from "../../utils/formatDate.js";
import Button from "../common/Button.jsx";

function TeacherJoinRequestCard({
  isApproving = false,
  isRejecting = false,
  onApprove,
  onReject,
  request,
}) {
  const isProcessing = isApproving || isRejecting;

  return (
    <article className="teacher-join-request-card">
      <div className="teacher-join-request-card__details">
        <div>
          <h3>{request.name || "Teacher"}</h3>
          <p>{request.email}</p>
          <span>Requested {formatDate(request.createdAt)}</span>
        </div>
        <span className="teacher-join-request-card__status">
          {request.status}
        </span>
      </div>

      {request.status === "pending" && (
        <div className="teacher-join-request-card__actions">
          <Button
            disabled={isProcessing}
            isLoading={isApproving}
            onClick={() => onApprove(request)}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
          <button
            className="link-button link-button--secondary"
            disabled={isProcessing}
            onClick={() => onReject(request)}
            type="button"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </button>
        </div>
      )}
    </article>
  );
}

export default TeacherJoinRequestCard;
