import Button from "../common/Button.jsx";

function ClassSubjectGroup({
  classRecord,
  isDirty = false,
  isSaving = false,
  onSave,
  onToggleSubject,
  selectedSubjectIds,
  subjects,
}) {
  const selectedSubjectIdSet = new Set(selectedSubjectIds);

  return (
    <section className="class-subject-group" aria-labelledby={`${classRecord.id}-title`}>
      <div className="class-subject-group__header">
        <div>
          <h2 id={`${classRecord.id}-title`}>{classRecord.name}</h2>
          <p>{classRecord.code}</p>
        </div>
        <span>
          {selectedSubjectIds.length} of {subjects.length}
        </span>
      </div>

      <div className="class-subject-options">
        {subjects.map((subject) => (
          <label className="class-subject-option" key={subject.id}>
            <input
              checked={selectedSubjectIdSet.has(subject.id)}
              disabled={isSaving}
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

      <div className="class-subject-group__actions">
        <Button disabled={!isDirty} isLoading={isSaving} onClick={() => onSave(classRecord.id)}>
          {isSaving ? "Saving..." : "Save Mappings"}
        </Button>
      </div>
    </section>
  );
}

export default ClassSubjectGroup;
