function ClassAssignmentGroup({
  classRecord,
  disabled = false,
  onToggleSubject,
  selectedSubjectIds,
  subjects,
}) {
  const selectedSubjectIdSet = new Set(selectedSubjectIds);

  return (
    <section
      className="teacher-assignment-group"
      aria-labelledby={`teacher-assignment-${classRecord.id}`}
    >
      <div className="teacher-assignment-group__header">
        <div>
          <h2 id={`teacher-assignment-${classRecord.id}`}>{classRecord.name}</h2>
          <p>{classRecord.code}</p>
        </div>
        <span>
          {selectedSubjectIds.length} of {subjects.length}
        </span>
      </div>

      <div className="teacher-assignment-options">
        {subjects.map((subject) => (
          <label className="teacher-assignment-option" key={subject.id}>
            <input
              checked={selectedSubjectIdSet.has(subject.id)}
              disabled={disabled}
              onChange={(event) =>
                onToggleSubject(classRecord.id, subject.id, event.target.checked)
              }
              type="checkbox"
            />
            <span>
              <strong>{subject.name}</strong>
              <small>{subject.code}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

export default ClassAssignmentGroup;
