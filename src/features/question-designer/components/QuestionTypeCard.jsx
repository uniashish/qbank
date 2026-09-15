import Icon from "../../../components/common/Icon.jsx";

function QuestionTypeCard({
  description,
  icon,
  onSelect,
  selected = false,
  title,
  type,
}) {
  return (
    <button
      aria-pressed={selected}
      className={[
        "question-type-card",
        selected ? "question-type-card--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(type)}
      type="button"
    >
      <span className="question-type-card__icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
      <span className="question-type-card__content">
        <span className="question-type-card__title">{title}</span>
        <span className="question-type-card__description">{description}</span>
      </span>
    </button>
  );
}

export default QuestionTypeCard;
