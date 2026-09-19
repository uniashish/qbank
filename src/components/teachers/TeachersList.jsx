import TeacherRow from "./TeacherRow.jsx";

function TeachersList({ teachers }) {
  return (
    <section className="teachers-table-card" aria-labelledby="teachers-list-title">
      <div className="teachers-section-header">
        <div>
          <h2 id="teachers-list-title">Teachers</h2>
          <p>Teacher accounts and approval status for this school.</p>
        </div>
        <span>{teachers.length}</span>
      </div>

      <table className="teachers-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Joined</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((teacher) => (
            <TeacherRow key={teacher.uid} teacher={teacher} />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default TeachersList;
