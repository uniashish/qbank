import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function QuestionPaperActions({ onCreatePaper }) {
  return (
    <div className="question-paper-actions">
      <Button onClick={onCreatePaper}>
        <Icon name="plus" size={18} />
        <span>Create New Paper</span>
      </Button>
    </div>
  );
}

export default QuestionPaperActions;
