import { formatDate } from "../../utils/formatDate.js";
import QuestionSelectionCheckbox from "../../features/question-sharing/QuestionSelectionCheckbox.jsx";
import SharedQuestionBadge from "../../features/question-sharing/SharedQuestionBadge.jsx";
import TagChip from "../tags/TagChip.jsx";
import DifficultyBadge from "./DifficultyBadge.jsx";
import QuestionActionsMenu from "./QuestionActionsMenu.jsx";
import QuestionTypeBadge from "./QuestionTypeBadge.jsx";

const VISIBLE_TAG_COUNT = 3;

function QuestionTags({ tags = [] }) {
  const visibleTags = tags.slice(0, VISIBLE_TAG_COUNT);
  const hiddenTagCount = Math.max(tags.length - VISIBLE_TAG_COUNT, 0);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="tag-list tag-list--compact question-bank-tags">
      {visibleTags.map((tag) => (
        <TagChip key={tag.toLowerCase()} label={tag} readOnly />
      ))}
      {hiddenTagCount > 0 && (
        <TagChip
          className="tag-chip--more"
          label={`+${hiddenTagCount} more`}
          readOnly
          title={tags.slice(VISIBLE_TAG_COUNT).join(", ")}
        />
      )}
    </div>
  );
}

function QuestionPrompt({ question }) {
  return (
    <div className="question-bank-question">
      <p className="question-bank-prompt">{question.prompt}</p>
      {question.access?.type === "shared" && (
        <SharedQuestionBadge ownerName={question.shareInfo?.ownerName} />
      )}
      <QuestionTags tags={question.tags} />
    </div>
  );
}

function QuestionRow({
  isActionLoading = false,
  isSelected = false,
  onDelete,
  onEdit,
  onRemove,
  onSelectionChange,
  onView,
  question,
  selectionMode = false,
  variant = "table",
}) {
  const access = question.access ?? {
    canDelete: true,
    canEdit: true,
    canRemove: false,
  };
  const selectionControl = selectionMode ? (
    <QuestionSelectionCheckbox
      checked={isSelected}
      label={`Select question: ${question.prompt}`}
      onChange={(isChecked) => onSelectionChange(question.id, isChecked)}
    />
  ) : null;
  const actions = (
    <QuestionActionsMenu
      canDelete={Boolean(onDelete) && access.canDelete}
      canEdit={Boolean(onEdit) && access.canEdit}
      canRemove={Boolean(onRemove) && access.canRemove}
      disabled={isActionLoading}
      onDelete={() => onDelete?.(question)}
      onEdit={() => onEdit?.(question)}
      onRemove={() => onRemove?.(question)}
      onView={() => onView?.(question)}
    />
  );

  if (variant === "card") {
    return (
      <article className="question-bank-card">
        <header className="question-bank-card__header">
          {selectionControl}
          <QuestionPrompt question={question} />
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
      {selectionMode && (
        <td className="question-bank-selection-cell">{selectionControl}</td>
      )}
      <td>
        <QuestionPrompt question={question} />
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
