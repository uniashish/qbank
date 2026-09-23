import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function TemplateEmptyState({ isSearching = false, onCreateTemplate }) {
  const title = isSearching ? "No matching templates" : "No templates yet";
  const description = isSearching
    ? "Try another template name or description."
    : "Create your first reusable question paper template.";

  return (
    <div className="question-paper-template-empty">
      <span className="question-paper-template-empty__icon" aria-hidden="true">
        <Icon name="fileText" size={22} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      {!isSearching && (
        <Button
          className="question-paper-template-empty__button"
          onClick={onCreateTemplate}
        >
          <Icon name="plus" size={18} />
          <span>Create Template</span>
        </Button>
      )}
    </div>
  );
}

export default TemplateEmptyState;
