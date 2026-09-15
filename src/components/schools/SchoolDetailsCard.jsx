function renderValue(value) {
  return value || "Not set";
}

function SchoolDetailsCard({ children, items, title }) {
  return (
    <section className="school-details-card">
      <div className="school-details-card__header">
        <h2>{title}</h2>
      </div>
      {items ? (
        <dl className="school-details-list">
          {items.map((item) => (
            <div key={item.label}>
              <dt>{item.label}</dt>
              <dd>{renderValue(item.value)}</dd>
            </div>
          ))}
        </dl>
      ) : (
        children
      )}
    </section>
  );
}

export default SchoolDetailsCard;
