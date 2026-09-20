import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import PaperSaveStatus from "./PaperSaveStatus.jsx";

function PaperDesignerHeader({
  answerKeyAction = null,
  canAddQuestion = false,
  finalizeAction = null,
  isReadOnly = false,
  onAddQuestion,
  onBack,
  onSaveDraft,
  isSaving = false,
  saveStatus,
  title,
}) {
  return (
    <header className="paper-designer-header">
      <div className="paper-designer-header__content">
        <p className="question-papers-header__eyebrow">Question Paper Designer</p>
        <h1>{title}</h1>
        <PaperSaveStatus saveStatus={saveStatus} />
      </div>

      <div className="paper-designer-header__actions">
        <Button onClick={onBack} type="button" variant="secondary">
          <Icon name="arrowLeft" size={18} />
          <span>Back</span>
        </Button>
        {answerKeyAction}
        {!isReadOnly && (
          <>
            <Button
              disabled={!canAddQuestion}
              onClick={onAddQuestion}
              type="button"
              variant="secondary"
            >
              <Icon name="plus" size={18} />
              <span>Add Question</span>
            </Button>
            <Button isLoading={isSaving} onClick={onSaveDraft} type="button">
              <Icon name="save" size={18} />
              <span>Save Draft</span>
            </Button>
            {finalizeAction}
          </>
        )}
        {isReadOnly && (
          <Button disabled type="button" variant="secondary">
            <Icon name="copy" size={18} />
            <span>Create Editable Copy</span>
          </Button>
        )}
      </div>
    </header>
  );
}

export default PaperDesignerHeader;
