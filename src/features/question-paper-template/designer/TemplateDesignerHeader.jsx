import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import PaperSaveStatus from "../../question-paper/designer/PaperSaveStatus.jsx";

function TemplateDesignerHeader({
  canSave = false,
  isSaving = false,
  onBack,
  onSaveTemplate,
  saveStatus,
  title,
}) {
  return (
    <header className="paper-designer-header template-designer-header">
      <div className="paper-designer-header__content">
        <p className="question-paper-template-header__eyebrow">
          Question Paper Template
        </p>
        <h1>{title}</h1>
        <PaperSaveStatus saveStatus={saveStatus} />
      </div>

      <div className="paper-designer-header__actions">
        <Button onClick={onBack} type="button" variant="secondary">
          <Icon name="arrowLeft" size={18} />
          <span>Back</span>
        </Button>
        <Button
          disabled={!canSave}
          isLoading={isSaving}
          onClick={onSaveTemplate}
          type="button"
        >
          <Icon name="save" size={18} />
          <span>Save Template</span>
        </Button>
      </div>
    </header>
  );
}

export default TemplateDesignerHeader;
