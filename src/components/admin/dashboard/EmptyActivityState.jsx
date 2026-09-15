import Icon from "../../common/Icon.jsx";

function EmptyActivityState() {
  return (
    <div className="empty-activity-state">
      <span className="empty-activity-state__icon" aria-hidden="true">
        <Icon name="dashboard" size={24} />
      </span>
      <h3>No recent activity yet.</h3>
      <p>
        Platform activity will appear here once schools and administrators are
        added.
      </p>
    </div>
  );
}

export default EmptyActivityState;
