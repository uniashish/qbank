import Icon from "../common/Icon.jsx";

function EmptyQuestionBankState({
  description = "Use Add New Question to start designing your first question.",
  title = "No questions yet",
}) {
  return (
    <div className="teacher-question-bank-empty">
      <span className="teacher-question-bank-empty__icon" aria-hidden="true">
        <Icon name="book" size={22} />
      </span>
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default EmptyQuestionBankState;
