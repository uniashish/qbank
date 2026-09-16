import { EditorContent } from "@tiptap/react";

function EditorContentArea({ editor, readOnly = false }) {
  return (
    <div
      className="rich-text-editor__document"
      data-readonly={readOnly ? "true" : "false"}
    >
      <EditorContent className="rich-text-editor__content" editor={editor} />
    </div>
  );
}

export default EditorContentArea;
