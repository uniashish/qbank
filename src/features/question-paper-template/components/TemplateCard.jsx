import { formatDate } from "../../../utils/formatDate.js";
import TemplateActions from "./TemplateActions.jsx";

function formatDuration(durationMinutes) {
  if (!durationMinutes) {
    return "Not set";
  }

  return `${durationMinutes} min`;
}

function TemplateCard({
  isArchiving = false,
  onArchiveTemplate,
  onDuplicateTemplate,
  onEditTemplate,
  onUseTemplate,
  template,
}) {
  return (
    <article className="question-paper-template-card">
      <header className="question-paper-template-card__header">
        <div>
          <h3>{template.name || "Untitled template"}</h3>
          <p>{template.description || "No description added."}</p>
        </div>
      </header>

      <dl className="question-paper-template-card__meta">
        <div>
          <dt>Duration</dt>
          <dd>{formatDuration(template.durationMinutes)}</dd>
        </div>
        <div>
          <dt>Marks</dt>
          <dd>{template.maximumMarks ?? "Not set"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{formatDate(template.updatedAt)}</dd>
        </div>
      </dl>

      <TemplateActions
        isArchiving={isArchiving}
        onArchiveTemplate={() => onArchiveTemplate?.(template)}
        onDuplicateTemplate={() => onDuplicateTemplate?.(template)}
        onEditTemplate={() => onEditTemplate?.(template)}
        onUseTemplate={() => onUseTemplate?.(template)}
      />
    </article>
  );
}

export default TemplateCard;
