import ReviewEmptyValue from "./ReviewEmptyValue.jsx";

function hasDisplayValue(value) {
  return String(value ?? "").trim().length > 0;
}

function ReviewField({ children, label, value }) {
  const hasChildren = children !== undefined && children !== null;
  const shouldDisplayValue = hasDisplayValue(value);

  return (
    <div className="question-review-field">
      <dt>{label}</dt>
      <dd>
        {hasChildren ? (
          children
        ) : shouldDisplayValue ? (
          value
        ) : (
          <ReviewEmptyValue />
        )}
      </dd>
    </div>
  );
}

export default ReviewField;
