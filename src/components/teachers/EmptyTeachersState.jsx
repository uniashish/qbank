import { Link } from "react-router-dom";

import Icon from "../common/Icon.jsx";

function EmptyTeachersState() {
  return (
    <section className="empty-teachers-state">
      <span className="empty-teachers-state__icon" aria-hidden="true">
        <Icon name="users" size={26} />
      </span>
      <h2>No teachers yet</h2>
      <p>Invite the first teacher to start preparing your faculty workspace.</p>
      <Link className="link-button link-button--primary" to="/school-admin/teachers/invite">
        <Icon name="plus" size={18} />
        <span>Invite Teacher</span>
      </Link>
    </section>
  );
}

export default EmptyTeachersState;
