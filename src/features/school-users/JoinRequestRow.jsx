import { formatDate } from "../../utils/formatDate.js";

function JoinRequestRow({ onReview, request }) {
  return (
    <tr>
      <td data-label="Name">
        <div className="school-users-identity">
          <strong>{request.name || "Teacher"}</strong>
          <span>{request.userId}</span>
        </div>
      </td>
      <td data-label="Email">{request.email}</td>
      <td data-label="Requested">{formatDate(request.createdAt)}</td>
      <td data-label="Actions">
        <button
          className="link-button link-button--primary"
          onClick={() => onReview(request)}
          type="button"
        >
          Review
        </button>
      </td>
    </tr>
  );
}

export default JoinRequestRow;
