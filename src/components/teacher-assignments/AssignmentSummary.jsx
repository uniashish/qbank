function AssignmentSummary({
  availableCount = 0,
  dirtyCount = 0,
  selectedCount = 0,
  teacher,
}) {
  return (
    <section className="assignment-summary" aria-label="Assignment summary">
      <div>
        <p className="assignment-summary__eyebrow">Teacher</p>
        <h2>{teacher?.name || "Selected teacher"}</h2>
        {teacher?.email && <p>{teacher.email}</p>}
      </div>
      <dl className="assignment-summary__stats">
        <div>
          <dt>Selected</dt>
          <dd>{selectedCount}</dd>
        </div>
        <div>
          <dt>Available</dt>
          <dd>{availableCount}</dd>
        </div>
        <div>
          <dt>Unsaved</dt>
          <dd>{dirtyCount}</dd>
        </div>
      </dl>
    </section>
  );
}

export default AssignmentSummary;
