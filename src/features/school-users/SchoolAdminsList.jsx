import { formatDate } from "../../utils/formatDate.js";

function SchoolAdminsList({
  currentUserId,
  onChangeRole,
  onView,
  schoolAdmins,
}) {
  if (schoolAdmins.length === 0) {
    return (
      <section className="school-users-empty">
        <h2>No School Admins found</h2>
        <p>Every school should have at least one active School Admin.</p>
      </section>
    );
  }

  return (
    <section className="school-users-table-card" aria-labelledby="school-admins-title">
      <div className="school-users-section-header">
        <div>
          <h2 id="school-admins-title">School Admins</h2>
          <p>Active School Admin accounts in this school.</p>
        </div>
        <span>{schoolAdmins.length}</span>
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
          {schoolAdmins.map((admin) => {
            const isFinalAdmin = schoolAdmins.length === 1;

            return (
              <tr key={admin.uid}>
                <td data-label="Name">
                  <div className="school-users-identity">
                    <strong>{admin.name || "School Admin"}</strong>
                    <span>
                      {admin.uid}
                      {admin.uid === currentUserId ? " (you)" : ""}
                    </span>
                  </div>
                </td>
                <td data-label="Email">{admin.email}</td>
                <td data-label="Joined">{formatDate(admin.createdAt)}</td>
                <td data-label="Actions">
                  <div className="school-users-actions">
                    <button
                      className="text-button"
                      onClick={() => onView(admin)}
                      type="button"
                    >
                      View
                    </button>
                    <button
                      className="text-button"
                      disabled={isFinalAdmin}
                      onClick={() => onChangeRole(admin, "teacher")}
                      type="button"
                    >
                      Change Role
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

export default SchoolAdminsList;
