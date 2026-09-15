function DashboardHeader({ actions, description, schoolName, title }) {
  return (
    <header className="school-admin-header">
      <div>
        <p className="school-admin-header__eyebrow">{schoolName}</p>
        <h1>{title}</h1>
        {description && (
          <p className="school-admin-header__description">{description}</p>
        )}
      </div>
      {actions && <div className="school-admin-header__actions">{actions}</div>}
    </header>
  );
}

export default DashboardHeader;
