import Icon from "../../common/Icon.jsx";

const statusItems = [
  {
    description: "Firebase Authentication configured",
    icon: "key",
    label: "Authentication",
  },
  {
    description: "Cloud Firestore configured",
    icon: "database",
    label: "Database",
  },
];

function SystemStatusCard() {
  return (
    <section className="dashboard-card" aria-labelledby="system-status-title">
      <div className="dashboard-card__header">
        <h2 id="system-status-title">System status</h2>
        <p>Configuration state for core QBank services.</p>
      </div>
      <div className="system-status-list">
        {statusItems.map((item) => (
          <div className="system-status-item" key={item.label}>
            <span className="system-status-item__icon" aria-hidden="true">
              <Icon name={item.icon} size={20} />
            </span>
            <div>
              <p>{item.label}</p>
              <span>{item.description}</span>
            </div>
            <strong>Configured</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

export default SystemStatusCard;
