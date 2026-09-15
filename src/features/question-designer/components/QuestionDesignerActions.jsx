import Button from "../../../components/common/Button.jsx";

function QuestionDesignerActions({
  canContinue = false,
  canGoBack = false,
  canSave = false,
  currentStep = 1,
  isSaving = false,
  mode = "create",
  onBack,
  onCancel,
  onContinue,
  onSave,
}) {
  const isReviewStep = currentStep === 4;
  const primaryLabel = isReviewStep
    ? isSaving
      ? "Saving..."
      : mode === "edit"
        ? "Update Question"
        : "Save Question"
    : "Continue \u2192";
  const primaryAction = isReviewStep ? onSave : onContinue;
  const isPrimaryDisabled = isSaving || (isReviewStep ? !canSave : !canContinue);

  return (
    <footer className="question-designer-actions">
      <div className="question-designer-actions__group">
        {canGoBack && (
          <Button disabled={isSaving} onClick={onBack} variant="secondary">
            {"\u2190"} Back
          </Button>
        )}
        <Button disabled={isSaving} onClick={onCancel} variant="secondary">
          Cancel
        </Button>
      </div>
      <Button
        disabled={isPrimaryDisabled}
        isLoading={isReviewStep && isSaving}
        onClick={primaryAction}
      >
        {primaryLabel}
      </Button>
    </footer>
  );
}

export default QuestionDesignerActions;
