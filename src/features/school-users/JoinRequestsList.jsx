import JoinRequestRow from "./JoinRequestRow.jsx";

function JoinRequestsList({ onReview, requests }) {
  if (requests.length === 0) {
    return (
      <section className="school-users-empty">
        <h2>No pending join requests</h2>
        <p>New teacher requests will appear here when join requests are enabled.</p>
      </section>
    );
  }

  return (
    <section className="school-users-table-card" aria-labelledby="join-requests-title">
      <div className="school-users-section-header">
        <div>
          <h2 id="join-requests-title">Pending Join Requests</h2>
          <p>Review teacher access requests for this school.</p>
        </div>
        <span>{requests.length}</span>
      </div>

      <table className="school-users-table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col">Requested</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <JoinRequestRow
              key={request.userId}
              onReview={onReview}
              request={request}
            />
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default JoinRequestsList;
