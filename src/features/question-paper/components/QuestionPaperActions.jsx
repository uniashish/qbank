import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function QuestionPaperActions({ onCreatePaper, onUseTemplate }) {
  return (
    <div className="question-paper-actions">
      <Button onClick={onCreatePaper}>
        <Icon name="plus" size={18} />
        <span>Create New Paper</span>
      </Button>
      <Button onClick={onUseTemplate} variant="secondary">
        <Icon name="fileText" size={18} />
        <span>Use Template</span>
      </Button>
    </div>
  );
}

export default QuestionPaperActions;
