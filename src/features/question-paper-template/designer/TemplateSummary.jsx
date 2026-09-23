function TemplateSummary({ summary }) {
  return (
    <aside
      className="paper-summary template-summary"
      aria-labelledby="template-summary-title"
    >
      <div className="paper-summary__header">
        <h2 id="template-summary-title">Summary</h2>
        <span className="template-summary__status">{summary.status}</span>
      </div>

      <dl className="paper-summary__list">
        <div>
          <dt>Template Name</dt>
          <dd>{summary.templateName}</dd>
        </div>
        <div>
          <dt>Default Exam Name</dt>
          <dd>{summary.defaultExamName}</dd>
        </div>
        <div>
          <dt>Default Duration</dt>
          <dd>{summary.defaultDuration}</dd>
        </div>
        <div>
          <dt>Default Maximum Marks</dt>
          <dd>{summary.defaultMaximumMarks}</dd>
        </div>
        <div>
          <dt>Sections</dt>
          <dd>{summary.sectionCount}</dd>
        </div>
        <div>
          <dt>Section Target Marks</dt>
          <dd>{summary.sectionTargetMarks}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{summary.status}</dd>
        </div>
      </dl>

      {summary.sectionTargetWarning && (
        <div className="template-summary__warning" role="status">
          <span>
            Section targets: {summary.sectionTargetWarning.sectionTargetMarks}
          </span>
          <span>
            Template maximum marks:{" "}
            {summary.sectionTargetWarning.defaultMaximumMarks}
          </span>
        </div>
      )}
    </aside>
  );
}

export default TemplateSummary;
