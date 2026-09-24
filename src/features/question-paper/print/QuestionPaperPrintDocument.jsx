import RichDocumentRenderer from "../../../components/rich-editor/RichDocumentRenderer.jsx";
import AnswerKeyQuestion from "../answer-key/AnswerKeyQuestion.jsx";
import { QUESTION_PAPER_PRINT_EXTENSIONS } from "./questionPaperPrintExtensions.js";

function QuestionPaperPrintDocument({
  answerKey,
  documentContent,
  includeAnswerKey = false,
  includePaper = true,
}) {
  const answerEntries = Array.isArray(answerKey?.entries)
    ? answerKey.entries
    : [];

  return (
    <div className="question-paper-print-document">
      {includePaper && (
        <section
          aria-label="Question paper"
          className="question-paper-print-section question-paper-print-paper"
        >
          <RichDocumentRenderer
            ariaLabel="Question paper print document"
            className="question-paper-print-paper__renderer"
            content={documentContent}
            extensions={QUESTION_PAPER_PRINT_EXTENSIONS}
            mode="print"
            placeholder="Question paper"
          />
        </section>
      )}

      {includeAnswerKey && (
        <section
          aria-labelledby="question-paper-print-answer-key-title"
          className="question-paper-print-section question-paper-print-answer-key"
        >
          <header className="question-paper-print-answer-key__header">
            <p className="question-papers-header__eyebrow">Answer Key</p>
            <h1 id="question-paper-print-answer-key-title">ANSWER KEY</h1>
            <p>
              {answerEntries.length} question
              {answerEntries.length === 1 ? "" : "s"}
            </p>
          </header>

          {answerEntries.length > 0 ? (
            <div className="answer-key-preview">
              {answerEntries.map((entry) => (
                <AnswerKeyQuestion entry={entry} key={entry.blockId} />
              ))}
            </div>
          ) : (
            <p className="answer-key-empty">No questions in this paper.</p>
          )}
        </section>
      )}
    </div>
  );
}

export default QuestionPaperPrintDocument;
