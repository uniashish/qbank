import EmptyActivityState from "./EmptyActivityState.jsx";

function RecentActivity() {
  return (
    <section className="dashboard-card" aria-labelledby="recent-activity-title">
      <div className="dashboard-card__header">
        <h2 id="recent-activity-title">Recent activity</h2>
        <p>New platform changes and user activity will be listed here.</p>
      </div>
      <EmptyActivityState />
    </section>
  );
}

export default RecentActivity;
