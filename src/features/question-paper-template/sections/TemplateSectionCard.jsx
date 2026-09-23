import Icon from "../../../components/common/Icon.jsx";
import { formatTemplateSectionMarks } from "./templateSectionUtils.js";

function TemplateSectionCard({
  index,
  isFirst,
  isLast,
  onEdit,
  onMoveDown,
  onMoveUp,
  onRemove,
  section,
}) {
  const sectionLabel = section.title || `Section ${index + 1}`;

  return (
    <article className="template-section-card">
      <div className="template-section-card__content">
        <p className="template-section-card__eyebrow">Section {index + 1}</p>
        <h3>{sectionLabel}</h3>
        {section.subtitle && <p>{section.subtitle}</p>}
        <span>{formatTemplateSectionMarks(section.targetMarks)}</span>
      </div>

      <div className="template-section-card__actions">
        <button
          aria-label={`Edit ${sectionLabel}`}
          className="template-section-card__button"
          onClick={onEdit}
          title="Edit section"
          type="button"
        >
          <Icon name="edit" size={15} />
          <span>Edit</span>
        </button>
        <button
          aria-label={`Move ${sectionLabel} up`}
          className="template-section-card__button"
          disabled={isFirst}
          onClick={onMoveUp}
          title="Move section up"
          type="button"
        >
          <Icon name="arrowUp" size={15} />
          <span>Move Up</span>
        </button>
        <button
          aria-label={`Move ${sectionLabel} down`}
          className="template-section-card__button"
          disabled={isLast}
          onClick={onMoveDown}
          title="Move section down"
          type="button"
        >
          <Icon name="arrowDown" size={15} />
          <span>Move Down</span>
        </button>
        <button
          aria-label={`Remove ${sectionLabel}`}
          className="template-section-card__button template-section-card__button--danger"
          onClick={onRemove}
          title="Remove section"
          type="button"
        >
          <Icon name="trash" size={15} />
          <span>Remove</span>
        </button>
      </div>
    </article>
  );
}

export default TemplateSectionCard;
