import Button from "../../components/common/Button.jsx";

function getShareStatusLabel(activeCount, selectedQuestionCount) {
  if (activeCount === 0) {
    return "";
  }

  if (activeCount === selectedQuestionCount) {
    return "Already shared";
  }

  return `${activeCount} of ${selectedQuestionCount} already shared`;
}

function TeacherMultiSelect({
  disabled = false,
  onRevokeShares,
  onSelectionChange,
  revokingTeacherId = "",
  selectedQuestionCount = 0,
  selectedTeacherIds = [],
  shareStateByTeacherId,
  teachers = [],
}) {
  const selectedTeacherIdSet = new Set(selectedTeacherIds);

  if (teachers.length === 0) {
    return (
      <div className="teacher-multi-select__empty">
        No other active teachers are available in this school.
      </div>
    );
  }

  function handleToggleTeacher(teacherId, isSelected) {
    const nextSelectedIds = new Set(selectedTeacherIds);

    if (isSelected) {
      nextSelectedIds.add(teacherId);
    } else {
      nextSelectedIds.delete(teacherId);
    }

    onSelectionChange([...nextSelectedIds]);
  }

  return (
    <div className="teacher-multi-select">
      {teachers.map((teacher) => {
        const shareState = shareStateByTeacherId.get(teacher.uid);
        const activeShareIds = shareState?.activeShareIds ?? [];
        const activeShareCount = shareState?.activeShareQuestionIds.size ?? 0;
        const isFullyShared =
          selectedQuestionCount > 0 && activeShareCount === selectedQuestionCount;
        const isChecked =
          isFullyShared || selectedTeacherIdSet.has(teacher.uid);
        const statusLabel = getShareStatusLabel(
          activeShareCount,
          selectedQuestionCount,
        );

        return (
          <div className="teacher-multi-select__row" key={teacher.uid}>
            <label className="teacher-multi-select__teacher">
              <input
                checked={isChecked}
                disabled={disabled || isFullyShared}
                onChange={(event) =>
                  handleToggleTeacher(teacher.uid, event.target.checked)
                }
                type="checkbox"
              />
              <span>
                <strong>{teacher.name}</strong>
                <small>{teacher.email}</small>
              </span>
            </label>

            {statusLabel && (
              <span className="teacher-multi-select__status">{statusLabel}</span>
            )}

            {activeShareIds.length > 0 && (
              <Button
                className="teacher-multi-select__revoke"
                disabled={disabled}
                isLoading={revokingTeacherId === teacher.uid}
                onClick={() => onRevokeShares(teacher.uid, activeShareIds)}
                variant="secondary"
              >
                Revoke
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TeacherMultiSelect;
