import Button from "../common/Button.jsx";
import AssignmentSummary from "./AssignmentSummary.jsx";
import ClassAssignmentGroup from "./ClassAssignmentGroup.jsx";

function TeacherAssignmentEditor({
  assignmentGroups,
  dirtyCount = 0,
  isLoading = false,
  isSaving = false,
  onSave,
  onToggleSubject,
  selectedCount = 0,
  selectedSubjectIdsByClass,
  teacher,
}) {
  const availableCount = assignmentGroups.reduce(
    (total, group) => total + group.subjects.length,
    0,
  );

  return (
    <div className="teacher-assignment-editor">
      <AssignmentSummary
        availableCount={availableCount}
        dirtyCount={dirtyCount}
        selectedCount={selectedCount}
        teacher={teacher}
      />

      {isLoading ? (
        <div className="teacher-assignment-loading" aria-live="polite">
          Loading teacher assignments...
        </div>
      ) : (
        <div className="teacher-assignment-groups">
          {assignmentGroups.map((group) => (
            <ClassAssignmentGroup
              classRecord={group.classRecord}
              disabled={isSaving}
              key={group.classRecord.id}
              onToggleSubject={onToggleSubject}
              selectedSubjectIds={
                selectedSubjectIdsByClass[group.classRecord.id] ?? []
              }
              subjects={group.subjects}
            />
          ))}
        </div>
      )}

      <div className="teacher-assignment-editor__actions">
        <Button disabled={dirtyCount === 0 || isLoading} isLoading={isSaving} onClick={onSave}>
          {isSaving ? "Saving..." : "Save Assignments"}
        </Button>
      </div>
    </div>
  );
}

export default TeacherAssignmentEditor;
