import { Link } from "react-router-dom";

import Icon from "../common/Icon.jsx";

function QuickActions({ actions }) {
  return (
    <section className="school-admin-card" aria-labelledby="school-actions-title">
      <div className="school-admin-card__header">
        <h2 id="school-actions-title">Quick actions</h2>
        <p>Open school workflows as they become available.</p>
      </div>
      <div className="school-admin-actions">
        {actions.map((action) => (
          <Link className="school-admin-action" key={action.path} to={action.path}>
            <span className="school-admin-action__icon" aria-hidden="true">
              <Icon name={action.icon} size={20} />
            </span>
            <span>{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
