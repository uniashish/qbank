import Icon from "../../../components/common/Icon.jsx";

const TEMPLATE_ACTIONS = [
  {
    disabled: true,
    icon: "fileText",
    key: "use",
    label: "Use Template",
    title: "Template use will be enabled in a later phase.",
  },
  {
    icon: "edit",
    key: "edit",
    label: "Edit",
    title: "Edit this template.",
  },
  {
    disabled: true,
    icon: "copy",
    key: "duplicate",
    label: "Duplicate",
    title: "Template duplication will be enabled in a later phase.",
  },
  {
    danger: true,
    icon: "trash",
    key: "archive",
    label: "Archive",
    title: "Archive this template.",
  },
];

function TemplateActions({
  isArchiving = false,
  onArchiveTemplate,
  onDuplicateTemplate,
  onEditTemplate,
  onUseTemplate,
}) {
  const handlers = {
    archive: onArchiveTemplate,
    duplicate: onDuplicateTemplate,
    edit: onEditTemplate,
    use: onUseTemplate,
  };

  return (
    <div
      className="question-paper-template-card__actions"
      aria-label="Template actions"
    >
      {TEMPLATE_ACTIONS.map((action) => {
        const isArchiveAction = action.key === "archive";
        const isDisabled =
          action.disabled ||
          !handlers[action.key] ||
          (isArchiveAction && isArchiving);

        return (
          <button
            className={[
              "question-paper-template-card__action",
              action.danger
                ? "question-paper-template-card__action--danger"
                : "",
            ]
              .filter(Boolean)
              .join(" ")}
            disabled={isDisabled}
            key={action.key}
            onClick={handlers[action.key]}
            title={
              isArchiving && isArchiveAction
                ? "Archiving template."
                : action.title
            }
            type="button"
          >
            <Icon name={action.icon} size={16} />
            <span>
              {isArchiving && isArchiveAction ? "Archiving" : action.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default TemplateActions;
