import RichTextEditor from "../../../components/rich-editor/RichTextEditor.jsx";

const EMPTY_EXTENSIONS = [];

function DocumentCanvas({
  ariaLabel = "Document editor",
  children = null,
  className = "",
  documentContent,
  extensions = EMPTY_EXTENSIONS,
  onDocumentChange,
  onEditorReady,
  placeholder = "Draft the document...",
  readOnly = false,
  title = "Document Canvas",
  titleId = "document-canvas-title",
}) {
  return (
    <section
      className={["paper-canvas", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <div className="paper-canvas__header">
        <h2 id={titleId}>{title}</h2>
      </div>

      <RichTextEditor
        ariaLabel={ariaLabel}
        className="paper-canvas__editor"
        extensions={extensions}
        onChange={onDocumentChange}
        onEditorReady={onEditorReady}
        placeholder={placeholder}
        readOnly={readOnly}
        value={documentContent}
      />
      {children}
    </section>
  );
}

export default DocumentCanvas;
