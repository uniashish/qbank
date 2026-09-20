import { useCallback, useEffect, useRef } from "react";

import Button from "../../../components/common/Button.jsx";
import QuestionPickerList from "./QuestionPickerList.jsx";
import QuestionPickerToolbar from "./QuestionPickerToolbar.jsx";
import QuestionSelectionTray from "./QuestionSelectionTray.jsx";
import { useQuestionPicker } from "./useQuestionPicker.js";

function QuestionPickerDialog({
  alreadyAddedQuestionIds = [],
  isOpen,
  onAddQuestions,
  onClose,
}) {
  const dialogRef = useRef(null);
  const picker = useQuestionPicker({ alreadyAddedQuestionIds });
  const { clearSelection } = picker;
  const handleClose = useCallback(() => {
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousActiveElement = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previousActiveElement?.focus?.();
    };
  }, [handleClose, isOpen]);

  if (!isOpen) {
    return null;
  }

  function handleAddQuestions() {
    if (picker.selectedQuestions.length === 0) {
      return;
    }

    onAddQuestions(picker.selectedQuestions);
    picker.clearSelection();
  }

  return (
    <div className="question-picker-layer">
      <button
        aria-label="Close question picker"
        className="question-picker-backdrop"
        onClick={handleClose}
        type="button"
      />
      <section
        aria-labelledby="question-picker-title"
        aria-modal="true"
        className="question-picker-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="question-picker-dialog__header">
          <div>
            <h2 id="question-picker-title">Add Questions</h2>
            <p>Select questions from your owned and shared question bank.</p>
          </div>
          <Button onClick={handleClose} type="button" variant="secondary">
            Cancel
          </Button>
        </header>

        <div className="question-picker-dialog__toolbar">
          <QuestionPickerToolbar
            classOptions={picker.classOptions}
            difficultyOptions={picker.difficultyOptions}
            filters={picker.filters}
            hasActiveFilters={picker.hasActiveFilters}
            onClearFilters={picker.clearFilters}
            onFilterChange={picker.updateFilter}
            onSearchChange={picker.setSearchTerm}
            questionTypeOptions={picker.questionTypeOptions}
            searchTerm={picker.searchTerm}
            subjectOptions={picker.subjectOptions}
            tagOptions={picker.tagOptions}
            topicOptions={picker.topicOptions}
          />
        </div>

        <div className="question-picker-dialog__body">
          <QuestionPickerList
            alreadyAddedQuestionIdSet={picker.alreadyAddedQuestionIdSet}
            error={picker.error}
            isLoading={picker.isLoading}
            onSelectionChange={picker.setQuestionSelected}
            questions={picker.questions}
            selectedQuestionIds={picker.selectedQuestionIds}
            totalQuestionCount={picker.totalQuestionCount}
          />
        </div>

        <QuestionSelectionTray
          onAddToPaper={handleAddQuestions}
          onClear={picker.clearSelection}
          selectedCount={picker.selectedQuestionIds.length}
          totalMarks={picker.selectedMarksTotal}
        />
      </section>
    </div>
  );
}

export default QuestionPickerDialog;
