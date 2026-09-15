import QuickActionCard from "./QuickActionCard.jsx";

function QuickActions({ actions }) {
  return (
    <section className="dashboard-card" aria-labelledby="quick-actions-title">
      <div className="dashboard-card__header">
        <h2 id="quick-actions-title">Quick actions</h2>
        <p>Start common platform workflows from one place.</p>
      </div>
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <QuickActionCard key={action.label} {...action} />
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
