import { formatDate } from "../../utils/formatDate.js";
import InvitationStatusBadge from "./InvitationStatusBadge.jsx";

function InvitationSummary({ adminProfile, invitation }) {
  if (adminProfile) {
    return (
      <section className="invitation-summary invitation-summary--assigned">
        <div>
          <p className="invitation-summary__eyebrow">
            School Administrator Assigned
          </p>
          <h2>{adminProfile.name || "School Administrator"}</h2>
          <p>{adminProfile.email}</p>
        </div>
      </section>
    );
  }

  if (invitation) {
    return (
      <section className="invitation-summary">
        <div>
          <p className="invitation-summary__eyebrow">Pending Invitation</p>
          <h2>{invitation.name}</h2>
          <p>{invitation.email}</p>
          <span>Created {formatDate(invitation.createdAt)}</span>
        </div>
        <InvitationStatusBadge status={invitation.status} />
      </section>
    );
  }

  return (
    <section className="invitation-summary invitation-summary--empty">
      <div>
        <p className="invitation-summary__eyebrow">
          Primary School Administrator
        </p>
        <h2>No school administrator assigned yet.</h2>
        <p>Invite the first School Admin for this school.</p>
      </div>
    </section>
  );
}

export default InvitationSummary;
