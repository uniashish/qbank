import Icon from "../../../components/common/Icon.jsx";
import { formatDate } from "../../../utils/formatDate.js";
import QuestionPaperStatusBadge from "./QuestionPaperStatusBadge.jsx";

function getPaperActions(paper) {
  const actions = [
    {
      ariaLabel: "Open paper",
      enabled: true,
      icon: "eye",
      key: "open",
      label: "Open",
    },
    {
      ariaLabel: "Preview answer key",
      enabled: true,
      icon: "key",
      key: "answer-key",
      label: "Answer Key",
    },
  ];

  if (paper.status === "final") {
    actions.push({
      enabled: false,
      icon: "copy",
      key: "copy",
      label: "Create Editable Copy",
      title: "Create Editable Copy will be enabled later.",
    });
  }

  actions.push(
    {
      ariaLabel: "Export paper",
      enabled: paper.status === "final",
      icon: "download",
      key: "export",
      label: "Export",
      title:
        paper.status === "final"
          ? "Export paper"
          : "Finalize this paper before exporting.",
    },
    {
      ariaLabel: "Export to Google Docs",
      enabled: paper.status === "final",
      icon: "fileText",
      key: "google-docs",
      label: "Google Docs",
      title:
        paper.status === "final"
          ? "Export to Google Docs"
          : "Finalize this paper before exporting to Google Docs.",
    },
    {
      danger: true,
      enabled: false,
      icon: "trash",
      key: "delete",
      label: "Delete",
    },
  );

  return actions;
}

function getClassLabel(paper) {
  return paper.className || paper.class || "Class not set";
}

function getUpdatedAtLabel(updatedAt) {
  return updatedAt ? formatDate(updatedAt) : "Not saved yet";
}

function QuestionPaperCard({
  onExportPaper,
  onExportGoogleDocs,
  onOpenAnswerKey,
  onOpenPaper,
  paper,
}) {
  function getActionHandler(action) {
    if (action.key === "open") {
      return () => onOpenPaper?.(paper);
    }

    if (action.key === "answer-key") {
      return () => onOpenAnswerKey?.(paper);
    }

    if (action.key === "export") {
      return () => onExportPaper?.(paper);
    }

    if (action.key === "google-docs") {
      return () => onExportGoogleDocs?.(paper);
    }

    return null;
  }

  return (
    <article className="question-paper-card">
      <header className="question-paper-card__header">
        <div>
          <h3>{paper.title || "Untitled paper"}</h3>
          <p>
            {getClassLabel(paper)} · {paper.subject || "Subject not set"}
          </p>
        </div>
        <QuestionPaperStatusBadge status={paper.status} />
      </header>

      <dl className="question-paper-card__meta">
        <div>
          <dt>Questions</dt>
          <dd>{paper.totalQuestions ?? 0}</dd>
        </div>
        <div>
          <dt>Marks</dt>
          <dd>{paper.totalMarks ?? 0}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{paper.difficulty || "Not set"}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{getUpdatedAtLabel(paper.updatedAt)}</dd>
        </div>
      </dl>

      <div className="question-paper-card__actions" aria-label="Paper actions">
        {getPaperActions(paper).map((action) => {
          const actionHandler = getActionHandler(action);

          return (
            <button
              aria-label={action.ariaLabel ?? `${action.label} paper`}
              className={[
                "question-paper-card__action",
                action.danger ? "question-paper-card__action--danger" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={!action.enabled || !actionHandler}
              key={action.key}
              onClick={
                action.enabled && actionHandler ? actionHandler : undefined
              }
              title={
                action.enabled
                  ? action.ariaLabel ?? `${action.label} paper`
                  : action.title ?? `${action.label} will be enabled later.`
              }
              type="button"
            >
              <Icon name={action.icon} size={16} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </article>
  );
}

export default QuestionPaperCard;
