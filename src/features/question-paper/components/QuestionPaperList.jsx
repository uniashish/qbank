import QuestionPaperCard from "./QuestionPaperCard.jsx";
import QuestionPaperEmptyState from "./QuestionPaperEmptyState.jsx";

const EMPTY_COPY = {
  draft: {
    description: "Create a paper to start collecting questions for review.",
    title: "No draft papers yet",
  },
  final: {
    description: "Completed papers will appear here when they are finalized.",
    title: "No finalized papers yet",
  },
};

function QuestionPaperGroup({
  onDeletePaper,
  onExportPaper,
  onExportGoogleDocs,
  onOpenAnswerKey,
  onOpenPaper,
  papers,
  status,
  title,
}) {
  const emptyCopy = EMPTY_COPY[status];

  return (
    <section className="question-paper-group" aria-labelledby={`${status}-papers`}>
      <div className="question-paper-group__header">
        <h3 id={`${status}-papers`}>{title}</h3>
        <span>{papers.length}</span>
      </div>

      {papers.length > 0 ? (
        <div className="question-paper-grid">
          {papers.map((paper) => (
            <QuestionPaperCard
              key={paper.id}
              onDeletePaper={onDeletePaper}
              onExportGoogleDocs={onExportGoogleDocs}
              onExportPaper={onExportPaper}
              onOpenAnswerKey={onOpenAnswerKey}
              onOpenPaper={onOpenPaper}
              paper={paper}
            />
          ))}
        </div>
      ) : (
        <QuestionPaperEmptyState
          description={emptyCopy.description}
          title={emptyCopy.title}
        />
      )}
    </section>
  );
}

function QuestionPaperList({
  draftPapers,
  finalizedPapers,
  onDeletePaper,
  onExportGoogleDocs,
  onExportPaper,
  onOpenAnswerKey,
  onOpenPaper,
}) {
  return (
    <div className="question-paper-list">
      <QuestionPaperGroup
        onDeletePaper={onDeletePaper}
        onExportGoogleDocs={onExportGoogleDocs}
        onExportPaper={onExportPaper}
        onOpenAnswerKey={onOpenAnswerKey}
        onOpenPaper={onOpenPaper}
        papers={draftPapers}
        status="draft"
        title="Drafts"
      />
      <QuestionPaperGroup
        onDeletePaper={onDeletePaper}
        onExportGoogleDocs={onExportGoogleDocs}
        onExportPaper={onExportPaper}
        onOpenAnswerKey={onOpenAnswerKey}
        onOpenPaper={onOpenPaper}
        papers={finalizedPapers}
        status="final"
        title="Finalized"
      />
    </div>
  );
}

export default QuestionPaperList;
