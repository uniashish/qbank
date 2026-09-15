function ReviewSection({
  children,
  className = "",
  description,
  title,
  titleId,
}) {
  return (
    <section
      aria-labelledby={titleId}
      className={["question-review-section", className].filter(Boolean).join(" ")}
    >
      <div className="question-review-section__header">
        <h4 id={titleId}>{title}</h4>
        {description && <p>{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default ReviewSection;
