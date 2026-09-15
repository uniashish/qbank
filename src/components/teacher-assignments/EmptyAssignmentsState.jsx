import Icon from "../common/Icon.jsx";

function EmptyAssignmentsState({
  action,
  description,
  icon = "users",
  title = "No assignments available",
}) {
  return (
    <section className="empty-assignments-state">
      <span className="empty-assignments-state__icon" aria-hidden="true">
        <Icon name={icon} size={22} />
      </span>
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {action}
    </section>
  );
}

export default EmptyAssignmentsState;
