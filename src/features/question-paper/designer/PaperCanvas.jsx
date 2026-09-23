import QuestionBlockNode from "../nodes/QuestionBlockNode.js";
import DocumentCanvas from "./DocumentCanvas.jsx";

const QUESTION_PAPER_EDITOR_EXTENSIONS = [QuestionBlockNode];

function PaperCanvas({
  documentContent,
  onDocumentChange,
  onEditorReady,
  readOnly = false,
}) {
  return (
    <DocumentCanvas
      ariaLabel="Question paper document"
      documentContent={documentContent}
      extensions={QUESTION_PAPER_EDITOR_EXTENSIONS}
      onDocumentChange={onDocumentChange}
      onEditorReady={onEditorReady}
      placeholder="Draft the question paper..."
      readOnly={readOnly}
      title="Document Canvas"
      titleId="paper-canvas-title"
    />
  );
}

export default PaperCanvas;
