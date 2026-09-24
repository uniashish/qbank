import QuestionPaperPrintDocument from "./QuestionPaperPrintDocument.jsx";
import "./question-paper-print.css";

function QuestionPaperPrintView({
  answerKey,
  documentContent,
  includeAnswerKey = false,
  includePaper = true,
}) {
  return (
    <QuestionPaperPrintDocument
      answerKey={answerKey}
      documentContent={documentContent}
      includeAnswerKey={includeAnswerKey}
      includePaper={includePaper}
    />
  );
}

export default QuestionPaperPrintView;
