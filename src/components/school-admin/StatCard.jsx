import Icon from "../common/Icon.jsx";

function StatCard({ icon, label, value }) {
  return (
    <article className="school-admin-stat-card">
      <span className="school-admin-stat-card__icon" aria-hidden="true">
        <Icon name={icon} size={21} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

export default StatCard;
