import Icon from "../common/Icon.jsx";

function QuestionActionButton({
  children,
  danger = false,
  disabled = false,
  icon,
  label,
  onClick,
}) {
  return (
    <button
      aria-label={label}
      className={[
        "question-bank-action-button",
        danger ? "question-bank-action-button--danger" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon name={icon} size={17} />
      <span>{children}</span>
    </button>
  );
}

function QuestionActionsMenu({
  canDelete = true,
  canEdit = true,
  canRemove = false,
  disabled = false,
  onDelete,
  onEdit,
  onRemove,
  onView,
}) {
  return (
    <div className="question-bank-actions" aria-label="Question actions">
      <QuestionActionButton
        disabled={disabled}
        icon="eye"
        label="View question"
        onClick={onView}
      >
        View
      </QuestionActionButton>
      {canEdit && (
        <QuestionActionButton
          disabled={disabled}
          icon="edit"
          label="Edit question"
          onClick={onEdit}
        >
          Edit
        </QuestionActionButton>
      )}
      {canDelete && (
        <QuestionActionButton
          danger
          disabled={disabled}
          icon="trash"
          label="Delete question"
          onClick={onDelete}
        >
          Delete
        </QuestionActionButton>
      )}
      {canRemove && (
        <QuestionActionButton
          danger
          disabled={disabled}
          icon="close"
          label="Remove shared question"
          onClick={onRemove}
        >
          Remove
        </QuestionActionButton>
      )}
    </div>
  );
}

export default QuestionActionsMenu;
