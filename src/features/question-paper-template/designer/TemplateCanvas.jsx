import DocumentCanvas from "../../question-paper/designer/DocumentCanvas.jsx";

function TemplateCanvas({ documentContent, onDocumentChange, onEditorReady }) {
  return (
    <DocumentCanvas
      ariaLabel="Question paper template document"
      className="template-canvas"
      documentContent={documentContent}
      onDocumentChange={onDocumentChange}
      onEditorReady={onEditorReady}
      placeholder="Design the reusable template structure..."
      title="Template Canvas"
      titleId="template-canvas-title"
    />
  );
}

export default TemplateCanvas;
