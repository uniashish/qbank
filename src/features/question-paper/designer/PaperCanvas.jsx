import RichTextEditor from "../../../components/rich-editor/RichTextEditor.jsx";
import QuestionBlockNode from "../nodes/QuestionBlockNode.js";

const QUESTION_PAPER_EDITOR_EXTENSIONS = [QuestionBlockNode];

function PaperCanvas({
  documentContent,
  onDocumentChange,
  onEditorReady,
  readOnly = false,
}) {
  return (
    <section className="paper-canvas" aria-labelledby="paper-canvas-title">
      <div className="paper-canvas__header">
        <h2 id="paper-canvas-title">Document Canvas</h2>
      </div>

      <RichTextEditor
        ariaLabel="Question paper document"
        className="paper-canvas__editor"
        extensions={QUESTION_PAPER_EDITOR_EXTENSIONS}
        onChange={onDocumentChange}
        onEditorReady={onEditorReady}
        placeholder="Draft the question paper..."
        readOnly={readOnly}
        value={documentContent}
      />
    </section>
  );
}

export default PaperCanvas;
