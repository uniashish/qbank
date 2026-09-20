import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEditor } from "@tiptap/react";

import EditorContentArea from "./EditorContentArea.jsx";
import EditorToolbar from "./EditorToolbar.jsx";
import {
  EMPTY_RICH_TEXT_DOCUMENT,
  createEditorExtensions,
} from "./editorExtensions.js";
import InsertImageDialog from "./dialogs/InsertImageDialog.jsx";
import InsertTableDialog from "./dialogs/InsertTableDialog.jsx";
import "./rich-text-editor.css";

const EMPTY_EXTRA_EXTENSIONS = [];

function getContentKey(content) {
  return JSON.stringify(content ?? EMPTY_RICH_TEXT_DOCUMENT);
}

function getInitialContent(value) {
  return value ?? EMPTY_RICH_TEXT_DOCUMENT;
}

function createEditorAttributes({ ariaDescribedBy, ariaLabel }) {
  return {
    ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
    "aria-label": ariaLabel,
    class: "rich-text-editor__prose",
  };
}

function collectImageSources(node, sources = new Set()) {
  if (!node) {
    return sources;
  }

  if (node.type === "image" && node.attrs?.src) {
    sources.add(node.attrs.src);
  }

  node.content?.forEach((childNode) => collectImageSources(childNode, sources));
  return sources;
}

function RichTextEditor({
  ariaDescribedBy,
  ariaLabel = "Rich text editor",
  className = "",
  extensions: extraExtensions = EMPTY_EXTRA_EXTENSIONS,
  onChange,
  onEditorReady,
  placeholder = "Enter content...",
  readOnly = false,
  value,
}) {
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  const objectUrlsRef = useRef(new Set());
  const lastContentKeyRef = useRef(getContentKey(getInitialContent(value)));
  const extensions = useMemo(
    () => [
      ...createEditorExtensions({ placeholder }),
      ...extraExtensions,
    ],
    [extraExtensions, placeholder],
  );

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const pruneUnusedObjectUrls = useCallback((content) => {
    const activeSources = collectImageSources(content);

    objectUrlsRef.current.forEach((objectUrl) => {
      if (activeSources.has(objectUrl)) {
        return;
      }

      URL.revokeObjectURL(objectUrl);
      objectUrlsRef.current.delete(objectUrl);
    });
  }, []);

  const editor = useEditor(
    {
      content: getInitialContent(value),
      editable: !readOnly,
      editorProps: {
        attributes: createEditorAttributes({ ariaDescribedBy, ariaLabel }),
      },
      extensions,
      onUpdate: ({ editor: updatedEditor }) => {
        const jsonContent = updatedEditor.getJSON();
        lastContentKeyRef.current = getContentKey(jsonContent);
        pruneUnusedObjectUrls(jsonContent);
        onChangeRef.current?.(jsonContent, {
          html: updatedEditor.getHTML(),
        });
      },
    },
    [extensions],
  );

  useEffect(() => {
    onEditorReady?.(editor);

    return () => {
      onEditorReady?.(null);
    };
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(!readOnly, false);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setOptions({
      editorProps: {
        attributes: createEditorAttributes({ ariaDescribedBy, ariaLabel }),
      },
    });
  }, [ariaDescribedBy, ariaLabel, editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = getInitialContent(value);
    const nextContentKey = getContentKey(nextContent);

    if (nextContentKey === lastContentKeyRef.current) {
      return;
    }

    editor.commands.setContent(nextContent, { emitUpdate: false });
    lastContentKeyRef.current = nextContentKey;
    pruneUnusedObjectUrls(nextContent);
  }, [editor, pruneUnusedObjectUrls, value]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((objectUrl) => {
        URL.revokeObjectURL(objectUrl);
      });
      objectUrls.clear();
    };
  }, []);

  const handleInsertImage = useCallback(
    ({ alt, src, title }) => {
      if (!editor || readOnly) {
        if (src?.startsWith("blob:")) {
          URL.revokeObjectURL(src);
        }
        return;
      }

      if (src?.startsWith("blob:")) {
        objectUrlsRef.current.add(src);
      }

      editor.chain().focus().setImage({ alt, src, title }).run();
    },
    [editor, readOnly],
  );

  const handleInsertTable = useCallback(
    ({ columns, rows }) => {
      if (!editor || readOnly) {
        return;
      }

      editor
        .chain()
        .focus()
        .insertTable({
          cols: columns,
          rows,
          withHeaderRow: false,
        })
        .run();
    },
    [editor, readOnly],
  );

  const rootClassName = ["rich-text-editor", className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} data-readonly={readOnly ? "true" : "false"}>
      {!readOnly && (
        <EditorToolbar
          editor={editor}
          onOpenImageDialog={() => setIsImageDialogOpen(true)}
          onOpenTableDialog={() => setIsTableDialogOpen(true)}
          readOnly={readOnly}
        />
      )}

      <EditorContentArea editor={editor} readOnly={readOnly} />

      <InsertImageDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onInsert={handleInsertImage}
      />
      <InsertTableDialog
        isOpen={isTableDialogOpen}
        onClose={() => setIsTableDialogOpen(false)}
        onInsert={handleInsertTable}
      />
    </div>
  );
}

export default RichTextEditor;
