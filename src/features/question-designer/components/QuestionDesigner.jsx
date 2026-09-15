import { useCallback, useEffect, useMemo, useRef } from "react";

import QuestionTypeEditor from "../editors/QuestionTypeEditor.jsx";
import { useQuestionDesigner } from "../hooks/useQuestionDesigner.js";
import { useTeacherQuestionAssignments } from "../hooks/useTeacherQuestionAssignments.js";
import { createQuestionDraft } from "../selectors/questionDraft.js";
import QuestionDetailsStep from "./details/QuestionDetailsStep.jsx";
import QuestionDesignerActions from "./QuestionDesignerActions.jsx";
import QuestionDesignerHeader from "./QuestionDesignerHeader.jsx";
import QuestionDesignerStepper from "./QuestionDesignerStepper.jsx";
import QuestionReviewStep from "./review/QuestionReviewStep.jsx";
import QuestionTypeSelector from "./QuestionTypeSelector.jsx";

function QuestionDesigner({
  initialQuestion = null,
  isOpen,
  isSaving = false,
  mode = "create",
  onClose,
  onSave,
  saveError = "",
}) {
  const dialogRef = useRef(null);
  const {
    canContinue,
    continueToNextStep,
    designerState,
    goToPreviousStep,
    questionDetailsErrors,
    questionTypeEditorActions,
    questionTypeEditorErrors,
    resetDesigner,
    selectQuestionType,
    setAssignedClass,
    setAssignedSubject,
    updateQuestionDetail,
  } = useQuestionDesigner({ initialQuestion, mode });
  const isTypeStep = designerState.currentStep === 1;
  const isDetailsStep = designerState.currentStep === 2;
  const isAnswerStep = designerState.currentStep === 3;
  const isReviewStep = designerState.currentStep === 4;
  const teacherAssignments = useTeacherQuestionAssignments({
    enabled: isOpen && designerState.currentStep >= 2,
  });
  const questionDraft = useMemo(
    () => createQuestionDraft(designerState, teacherAssignments),
    [designerState, teacherAssignments],
  );

  const handleClose = useCallback(() => {
    if (isSaving) {
      return;
    }

    resetDesigner();
    onClose();
  }, [isSaving, onClose, resetDesigner]);

  const handleSave = useCallback(() => {
    if (isSaving || typeof onSave !== "function") {
      return;
    }

    onSave(questionDraft);
  }, [isSaving, onSave, questionDraft]);

  useEffect(() => {
    if (!isOpen) {
      resetDesigner();
      return;
    }

    resetDesigner();
    dialogRef.current?.focus();
  }, [isOpen, resetDesigner]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) {
        handleClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleClose, isOpen, isSaving]);

  if (!isOpen) {
    return null;
  }

  const canContinueCurrentStep =
    isDetailsStep && canContinue
      ? !teacherAssignments.isLoading &&
        !teacherAssignments.error &&
        teacherAssignments.hasAssignments
      : canContinue;

  return (
    <div className="question-designer-overlay" role="presentation">
      <button
        aria-label="Close question designer"
        className="question-designer-backdrop"
        disabled={isSaving}
        onClick={handleClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-describedby="question-designer-description"
        aria-labelledby="question-designer-title"
        aria-modal="true"
        className="question-designer-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <p className="sr-only" id="question-designer-description">
          Select a question type to begin creating a reusable question.
        </p>
        <QuestionDesignerHeader
          isCloseDisabled={isSaving}
          mode={designerState.mode}
          onClose={handleClose}
        />
        <QuestionDesignerStepper currentStep={designerState.currentStep} />

        <div className="question-designer-body">
          {isTypeStep ? (
            <QuestionTypeSelector
              onSelectType={selectQuestionType}
              selectedType={designerState.questionType}
            />
          ) : isDetailsStep ? (
            <QuestionDetailsStep
              assignmentState={teacherAssignments}
              designerState={designerState}
              onClassChange={setAssignedClass}
              onFieldChange={updateQuestionDetail}
              onSubjectChange={setAssignedSubject}
              validationErrors={questionDetailsErrors}
            />
          ) : isAnswerStep ? (
            <QuestionTypeEditor
              designerState={designerState}
              editorActions={questionTypeEditorActions}
              validationErrors={questionTypeEditorErrors}
            />
          ) : isReviewStep ? (
            <QuestionReviewStep questionDraft={questionDraft} />
          ) : (
            null
          )}
          {(isSaving || saveError) && (
            <div
              className={[
                "question-designer-save-feedback",
                saveError ? "question-designer-save-feedback--error" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role={saveError ? "alert" : "status"}
            >
              {saveError || "Saving question..."}
            </div>
          )}
        </div>

        <QuestionDesignerActions
          canContinue={canContinueCurrentStep}
          canGoBack={designerState.currentStep > 1}
          canSave={typeof onSave === "function" && !isSaving}
          currentStep={designerState.currentStep}
          isSaving={isSaving}
          mode={designerState.mode}
          onBack={goToPreviousStep}
          onCancel={handleClose}
          onContinue={continueToNextStep}
          onSave={handleSave}
        />
      </section>
    </div>
  );
}

export default QuestionDesigner;
