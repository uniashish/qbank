import { formatDate } from "../../utils/formatDate.js";
import DifficultyBadge from "./DifficultyBadge.jsx";
import QuestionActionsMenu from "./QuestionActionsMenu.jsx";
import QuestionTypeBadge from "./QuestionTypeBadge.jsx";

function QuestionPrompt({ prompt }) {
  return <p className="question-bank-prompt">{prompt}</p>;
}

function QuestionRow({
  isActionLoading = false,
  onDelete,
  onEdit,
  onView,
  question,
  variant = "table",
}) {
  const actions = (
    <QuestionActionsMenu
      disabled={isActionLoading}
      onDelete={() => onDelete(question)}
      onEdit={() => onEdit(question)}
      onView={() => onView(question)}
    />
  );

  if (variant === "card") {
    return (
      <article className="question-bank-card">
        <header className="question-bank-card__header">
          <QuestionPrompt prompt={question.prompt} />
          <QuestionTypeBadge label={question.questionTypeLabel} />
        </header>

        <dl className="question-bank-card__meta">
          <div>
            <dt>Class</dt>
            <dd>{question.className}</dd>
          </div>
          <div>
            <dt>Subject</dt>
            <dd>{question.subjectName}</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>{question.topicName}</dd>
          </div>
          <div>
            <dt>Marks</dt>
            <dd>{question.marks}</dd>
          </div>
          <div>
            <dt>Difficulty</dt>
            <dd>
              <DifficultyBadge
                difficulty={question.difficulty}
                label={question.difficultyLabel}
              />
            </dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(question.createdAt)}</dd>
          </div>
        </dl>

        {actions}
      </article>
    );
  }

  return (
    <tr className="question-bank-table__row">
      <td>
        <QuestionPrompt prompt={question.prompt} />
      </td>
      <td>
        <QuestionTypeBadge label={question.questionTypeLabel} />
      </td>
      <td>{question.className}</td>
      <td>{question.subjectName}</td>
      <td>{question.topicName}</td>
      <td>{question.marks}</td>
      <td>
        <DifficultyBadge
          difficulty={question.difficulty}
          label={question.difficultyLabel}
        />
      </td>
      <td>{formatDate(question.createdAt)}</td>
      <td>{actions}</td>
    </tr>
  );
}

export default QuestionRow;
