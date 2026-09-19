import { useEffect, useRef, useState } from "react";

import Button from "../../components/common/Button.jsx";
import ClassAssignmentGroup from "../../components/teacher-assignments/ClassAssignmentGroup.jsx";
import { countSelections } from "../../components/teacher-assignments/assignmentSelectionUtils.js";

function ReviewJoinRequestDialog({
  assignmentGroups,
  isApproving = false,
  isRejecting = false,
  onApprove,
  onClose,
  onReject,
  request,
}) {
  const dialogRef = useRef(null);
  const [selectedSubjectIdsByClass, setSelectedSubjectIdsByClass] = useState({});
  const selectedCount = countSelections(selectedSubjectIdsByClass);
  const isProcessing = isApproving || isRejecting;

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const handleToggleSubject = (classId, subjectId, isSelected) => {
    setSelectedSubjectIdsByClass((currentSelections) => {
      const currentSubjectIds = currentSelections[classId] ?? [];
      const nextSubjectIds = isSelected
        ? [...new Set([...currentSubjectIds, subjectId])]
        : currentSubjectIds.filter((currentSubjectId) => currentSubjectId !== subjectId);

      return {
        ...currentSelections,
        [classId]: nextSubjectIds.sort(),
      };
    });
  };

  const canApprove = selectedCount > 0 && assignmentGroups.length > 0;

  return (
    <div className="school-users-dialog-layer" role="presentation">
      <button
        aria-label="Close review dialog"
        className="school-users-dialog-backdrop"
        disabled={isProcessing}
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="review-join-request-title"
        aria-modal="true"
        className="school-users-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="school-users-dialog__header">
          <div>
            <p>Join request</p>
            <h2 id="review-join-request-title">{request.name || "Teacher"}</h2>
            <span>{request.email}</span>
          </div>
          <button
            aria-label="Close review dialog"
            className="school-users-dialog__close"
            disabled={isProcessing}
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <div className="school-users-dialog__body">
          <section className="school-users-assignment-picker">
            <div className="school-users-dialog-section-header">
              <div>
                <h3>Assign classes and subjects</h3>
                <p>
                  Select at least one class-subject combination before approval.
                </p>
              </div>
              <span>{selectedCount}</span>
            </div>

            {assignmentGroups.length > 0 ? (
              <div className="teacher-assignment-groups">
                {assignmentGroups.map((group) => (
                  <ClassAssignmentGroup
                    classRecord={group.classRecord}
                    disabled={isProcessing}
                    key={group.classRecord.id}
                    onToggleSubject={handleToggleSubject}
                    selectedSubjectIds={
                      selectedSubjectIdsByClass[group.classRecord.id] ?? []
                    }
                    subjects={group.subjects}
                  />
                ))}
              </div>
            ) : (
              <p className="school-users-dialog__empty">
                Create class-subject mappings before approving join requests.
              </p>
            )}
          </section>
        </div>

        <footer className="school-users-dialog__actions">
          <button
            className="link-button link-button--secondary"
            disabled={isProcessing}
            onClick={() => onReject(request)}
            type="button"
          >
            {isRejecting ? "Rejecting..." : "Reject"}
          </button>
          <Button
            disabled={!canApprove || isProcessing}
            isLoading={isApproving}
            onClick={() => onApprove(request, selectedSubjectIdsByClass)}
          >
            {isApproving ? "Approving..." : "Approve"}
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default ReviewJoinRequestDialog;
