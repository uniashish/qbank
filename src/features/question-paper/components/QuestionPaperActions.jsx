import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";

function QuestionPaperActions({ onCreatePaper }) {
  return (
    <div className="question-paper-actions">
      <Button onClick={onCreatePaper}>
        <Icon name="plus" size={18} />
        <span>Create New Paper</span>
      </Button>
      <div className="question-paper-actions__template">
        <Button disabled title="Templates are coming later." variant="secondary">
          <Icon name="fileText" size={18} />
          <span>Use Template</span>
        </Button>
        <span>Coming later</span>
      </div>
    </div>
  );
}

export default QuestionPaperActions;
