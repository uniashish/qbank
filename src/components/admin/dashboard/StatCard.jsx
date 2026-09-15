import Icon from "../../common/Icon.jsx";

function StatCard({ description, icon, title, trend, value }) {
  return (
    <article className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__icon" aria-hidden="true">
          <Icon name={icon} size={21} />
        </span>
        <h2>{title}</h2>
      </div>
      <p className="stat-card__value">{value}</p>
      <div className="stat-card__footer">
        <p>{description}</p>
        {trend && <span>{trend}</span>}
      </div>
    </article>
  );
}

export default StatCard;
