import SchoolTableRow from "./SchoolTableRow.jsx";

function SchoolsTable({ schools }) {
  return (
    <div className="schools-table-card">
      <table className="schools-table">
        <thead>
          <tr>
            <th scope="col">School</th>
            <th scope="col">Code</th>
            <th scope="col">Location</th>
            <th scope="col">Status</th>
            <th scope="col">Primary Admin</th>
            <th scope="col">Created</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <SchoolTableRow key={school.id} school={school} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SchoolsTable;
