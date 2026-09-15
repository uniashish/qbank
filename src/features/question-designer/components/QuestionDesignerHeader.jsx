import Icon from "../../../components/common/Icon.jsx";

const MODE_TITLES = {
  create: "Create Question",
  duplicate: "Duplicate Question",
  edit: "Edit Question",
};

function QuestionDesignerHeader({
  isCloseDisabled = false,
  mode = "create",
  onClose,
}) {
  return (
    <header className="question-designer-header">
      <div>
        <p className="question-designer-header__eyebrow">Question Designer</p>
        <h2 id="question-designer-title">{MODE_TITLES[mode] ?? MODE_TITLES.create}</h2>
      </div>
      <button
        aria-label="Close question designer"
        className="icon-button question-designer-header__close"
        disabled={isCloseDisabled}
        onClick={onClose}
        type="button"
      >
        <Icon name="close" size={20} />
      </button>
    </header>
  );
}

export default QuestionDesignerHeader;
