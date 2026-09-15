import Icon from "../common/Icon.jsx";

function EmptyAcademicState({
  action,
  description,
  icon = "book",
  title = "Nothing here yet",
}) {
  return (
    <section className="empty-academic-state">
      <span className="empty-academic-state__icon" aria-hidden="true">
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

export default EmptyAcademicState;
