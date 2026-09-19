import Icon from "../common/Icon.jsx";

function EmptyTeachersState() {
  return (
    <section className="empty-teachers-state">
      <span className="empty-teachers-state__icon" aria-hidden="true">
        <Icon name="users" size={26} />
      </span>
      <h2>No teachers yet</h2>
      <p>Approved teacher accounts will appear here.</p>
    </section>
  );
}

export default EmptyTeachersState;
