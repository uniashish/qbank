import { useEffect, useMemo, useRef } from "react";
import { useEditor } from "@tiptap/react";

import EditorContentArea from "./EditorContentArea.jsx";
import {
  EMPTY_RICH_TEXT_DOCUMENT,
  createEditorExtensions,
} from "./editorExtensions.js";
import "./rich-text-editor.css";

const EMPTY_EXTRA_EXTENSIONS = [];

function getContentKey(content) {
  return JSON.stringify(content ?? EMPTY_RICH_TEXT_DOCUMENT);
}

function getInitialContent(content) {
  return content ?? EMPTY_RICH_TEXT_DOCUMENT;
}

function createEditorAttributes({ ariaDescribedBy, ariaLabel, mode }) {
  return {
    ...(ariaDescribedBy ? { "aria-describedby": ariaDescribedBy } : {}),
    ...(mode ? { "data-render-mode": mode } : {}),
    "aria-label": ariaLabel,
    class: "rich-text-editor__prose",
  };
}

function RichDocumentRenderer({
  ariaDescribedBy,
  ariaLabel = "Rich document",
  className = "",
  content,
  extensions: extraExtensions = EMPTY_EXTRA_EXTENSIONS,
  mode = "preview",
  placeholder = "Enter content...",
}) {
  const lastContentKeyRef = useRef(getContentKey(getInitialContent(content)));
  const extensions = useMemo(
    () => [
      ...createEditorExtensions({ placeholder }),
      ...extraExtensions,
    ],
    [extraExtensions, placeholder],
  );
  const editor = useEditor(
    {
      content: getInitialContent(content),
      editable: false,
      editorProps: {
        attributes: createEditorAttributes({
          ariaDescribedBy,
          ariaLabel,
          mode,
        }),
      },
      extensions,
    },
    [extensions],
  );

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setEditable(false, false);
  }, [editor]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    editor.setOptions({
      editorProps: {
        attributes: createEditorAttributes({
          ariaDescribedBy,
          ariaLabel,
          mode,
        }),
      },
    });
  }, [ariaDescribedBy, ariaLabel, editor, mode]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const nextContent = getInitialContent(content);
    const nextContentKey = getContentKey(nextContent);

    if (nextContentKey === lastContentKeyRef.current) {
      return;
    }

    editor.commands.setContent(nextContent, { emitUpdate: false });
    lastContentKeyRef.current = nextContentKey;
  }, [content, editor]);

  const rootClassName = [
    "rich-text-editor",
    "rich-document-renderer",
    `rich-document-renderer--${mode}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName} data-readonly="true">
      <EditorContentArea editor={editor} readOnly />
    </div>
  );
}

export default RichDocumentRenderer;
