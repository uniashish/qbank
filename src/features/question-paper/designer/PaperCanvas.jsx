import QuestionBlockNode from "../nodes/QuestionBlockNode.js";
import PaperInsertOverlay from "../editor-elements/PaperInsertOverlay.jsx";
import DocumentCanvas from "./DocumentCanvas.jsx";

const QUESTION_PAPER_EDITOR_EXTENSIONS = [QuestionBlockNode];

function PaperCanvas({
  documentContent,
  editor,
  onDocumentChange,
  onEditorReady,
  onOpenQuestionPicker,
  onInsertDivider,
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
    >
      <PaperInsertOverlay
        editor={editor}
        onAddQuestion={onOpenQuestionPicker}
        onInsertDivider={onInsertDivider}
        readOnly={readOnly}
      />
    </DocumentCanvas>
  );
}

export default PaperCanvas;
