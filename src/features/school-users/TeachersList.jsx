import { Link } from "react-router-dom";

import { formatDate } from "../../utils/formatDate.js";

function TeachersList({ onChangeRole, onView, teachers }) {
  if (teachers.length === 0) {
    return (
      <section className="school-users-empty">
        <h2>No active teachers</h2>
        <p>Approved teachers will appear here.</p>
      </section>
    );
  }

  return (
    <section className="school-users-table-card" aria-labelledby="teachers-title">
      <div className="school-users-section-header">
        <div>
          <h2 id="teachers-title">Teachers</h2>
          <p>Active teacher accounts in this school.</p>
        </div>
        <span>{teachers.length}</span>
      </div>

      <table className="school-users-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Joined</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <tr key={teacher.uid}>
              <td data-label="Name">
                <div className="school-users-identity">
                  <strong>{teacher.name || "Teacher"}</strong>
                  <span>{teacher.uid}</span>
                </div>
              </td>
              <td data-label="Email">{teacher.email}</td>
              <td data-label="Joined">{formatDate(teacher.createdAt)}</td>
              <td data-label="Actions">
                <div className="school-users-actions">
                  <button
                    className="text-button"
                    onClick={() => onView(teacher)}
                    type="button"
                  >
                    View
                  </button>
                  <Link
                    className="text-button"
                    to="/school-admin/teacher-assignments"
                  >
                    Manage Assignments
                  </Link>
                  <button
                    className="text-button"
                    onClick={() => onChangeRole(teacher, "school_admin")}
                    type="button"
                  >
                    Change Role
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default TeachersList;
