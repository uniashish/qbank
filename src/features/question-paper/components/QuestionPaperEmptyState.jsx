import Icon from "../../../components/common/Icon.jsx";

function QuestionPaperEmptyState({ description, title }) {
  return (
    <div className="question-paper-empty-state">
      <span className="question-paper-empty-state__icon" aria-hidden="true">
        <Icon name="fileText" size={22} />
      </span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default QuestionPaperEmptyState;
