function DashboardHeader({ actions, description, title }) {
  return (
    <header className="dashboard-header">
      <div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="dashboard-header__actions">{actions}</div>}
    </header>
  );
}

export default DashboardHeader;
