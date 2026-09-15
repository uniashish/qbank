import Icon from "../../common/Icon.jsx";

function EmptyTeacherAssignments() {
  return (
    <section className="empty-teacher-assignments">
      <span className="empty-teacher-assignments__icon" aria-hidden="true">
        <Icon name="book" size={22} />
      </span>
      <div>
        <h2>No classes or subjects have been assigned yet.</h2>
        <p>Please contact your School Administrator.</p>
      </div>
    </section>
  );
}

export default EmptyTeacherAssignments;
