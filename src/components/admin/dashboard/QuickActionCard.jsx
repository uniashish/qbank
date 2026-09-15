import { Link } from "react-router-dom";

import Icon from "../../common/Icon.jsx";

function QuickActionCard({ description, icon, label, path }) {
  return (
    <Link className="quick-action-card" to={path}>
      <span className="quick-action-card__icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <span>
        <span className="quick-action-card__label">{label}</span>
        <span className="quick-action-card__description">{description}</span>
      </span>
    </Link>
  );
}

export default QuickActionCard;
