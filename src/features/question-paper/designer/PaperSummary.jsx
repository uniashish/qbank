import QuestionPaperStatusBadge from "../components/QuestionPaperStatusBadge.jsx";
import { DIFFICULTY_ORDER } from "../utils/questionPaperDifficulty.js";

function formatOptionalValue(value) {
  return value == null || value === "" ? "Not set" : value;
}

function formatMarks(value) {
  const marks = Number(value ?? 0);

  return `${marks} mark${marks === 1 ? "" : "s"}`;
}

function TargetMarksStatus({ summary }) {
  if (!summary.targetMarks) {
    return null;
  }

  if (summary.overTargetMarks > 0) {
    return (
      <div className="paper-summary-target paper-summary-target--over">
        <dt>Over Target By</dt>
        <dd>{formatMarks(summary.overTargetMarks)}</dd>
      </div>
    );
  }

  return (
    <div className="paper-summary-target">
      <dt>Remaining</dt>
      <dd>{formatMarks(summary.remainingMarks)}</dd>
    </div>
  );
}

function CoverageList({ emptyLabel, items = [] }) {
  if (items.length === 0) {
    return <p className="paper-summary-empty">{emptyLabel}</p>;
  }

  return (
    <dl className="paper-summary-coverage">
      {items.map((item) => (
        <div key={item.label}>
          <dt>{item.label}</dt>
          <dd>{formatMarks(item.marks)}</dd>
        </div>
      ))}
    </dl>
  );
}

function PaperSummary({ summary }) {
  const distributionByDifficulty = new Map(
    summary.difficulty.distribution.map((item) => [item.difficulty, item]),
  );

  return (
    <aside className="paper-summary" aria-labelledby="paper-summary-title">
      <div className="paper-summary__header">
        <h2 id="paper-summary-title">Summary</h2>
        <QuestionPaperStatusBadge status={summary.status} />
      </div>

      <dl className="paper-summary__list">
        <div>
          <dt>Title</dt>
          <dd>{summary.title}</dd>
        </div>
        <div>
          <dt>Class</dt>
          <dd>{summary.className}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{summary.subjectName}</dd>
        </div>
        <div>
          <dt>Questions</dt>
          <dd>{summary.questionCount}</dd>
        </div>
        <div>
          <dt>Total Marks</dt>
          <dd>{formatMarks(summary.totalMarks)}</dd>
        </div>
        <div>
          <dt>Target Marks</dt>
          <dd>{formatOptionalValue(summary.targetMarks || summary.maximumMarks)}</dd>
        </div>
        <TargetMarksStatus summary={summary} />
      </dl>

      <section className="paper-summary-section" aria-labelledby="paper-difficulty-title">
        <div className="paper-summary-section__header">
          <h3 id="paper-difficulty-title">Difficulty</h3>
          <span>{summary.difficulty.overallDifficulty}</span>
        </div>
        <dl className="paper-summary-coverage">
          {DIFFICULTY_ORDER.map((difficulty) => {
            const item = distributionByDifficulty.get(difficulty);

            return (
              <div key={difficulty}>
                <dt>{item.label}</dt>
                <dd>{formatMarks(item.marks)}</dd>
              </div>
            );
          })}
        </dl>
      </section>

      <section className="paper-summary-section" aria-labelledby="paper-topic-title">
        <div className="paper-summary-section__header">
          <h3 id="paper-topic-title">Topic Coverage</h3>
        </div>
        <CoverageList
          emptyLabel="No question topics yet."
          items={summary.topicCoverage}
        />
      </section>

      <section className="paper-summary-section" aria-labelledby="paper-type-title">
        <div className="paper-summary-section__header">
          <h3 id="paper-type-title">Question Types</h3>
        </div>
        <CoverageList
          emptyLabel="No question types yet."
          items={summary.typeCoverage}
        />
      </section>
    </aside>
  );
}

export default PaperSummary;
