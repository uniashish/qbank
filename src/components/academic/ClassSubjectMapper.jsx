import ClassSubjectGroup from "./ClassSubjectGroup.jsx";

function ClassSubjectMapper({
  classes,
  dirtyClassIds,
  onSaveClass,
  onToggleSubject,
  savingClassId = "",
  selectedSubjectIdsByClass,
  subjects,
}) {
  return (
    <div className="class-subject-mapper">
      {classes.map((classRecord) => (
        <ClassSubjectGroup
          classRecord={classRecord}
          isDirty={dirtyClassIds.has(classRecord.id)}
          isSaving={savingClassId === classRecord.id}
          key={classRecord.id}
          onSave={onSaveClass}
          onToggleSubject={onToggleSubject}
          selectedSubjectIds={selectedSubjectIdsByClass[classRecord.id] ?? []}
          subjects={subjects}
        />
      ))}
    </div>
  );
}

export default ClassSubjectMapper;
