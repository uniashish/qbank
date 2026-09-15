import { formatDate } from "../../utils/formatDate.js";
import TeacherStatusBadge from "./TeacherStatusBadge.jsx";

function TeacherRow({ teacher }) {
  return (
    <tr>
      <td data-label="Name">
        <div className="teacher-table__identity">
          <strong>{teacher.name || "Teacher"}</strong>
          <span>{teacher.uid}</span>
        </div>
      </td>
      <td data-label="Email">{teacher.email}</td>
      <td data-label="Status">
        <TeacherStatusBadge status={teacher.status} />
      </td>
      <td data-label="Joined">{formatDate(teacher.createdAt)}</td>
      <td data-label="Actions">
        <span className="teacher-table__muted">No actions</span>
      </td>
    </tr>
  );
}

export default TeacherRow;
