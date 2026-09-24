import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Selection } from "@tiptap/pm/state";
import { useEditor } from "@tiptap/react";

import EditorContentArea from "./EditorContentArea.jsx";
import EditorToolbar from "./EditorToolbar.jsx";
import {
  EMPTY_RICH_TEXT_DOCUMENT,
  createEditorExtensions,
} from "./editorExtensions.js";
import InsertImageDialog from "./dialogs/InsertImageDialog.jsx";
import InsertTableDialog from "./dialogs/InsertTableDialog.jsx";
import EquationDialog from "./math/EquationDialog.jsx";
import {
  EQUATION_DIALOG_MODES,
  createInsertEquationRequest,
} from "./math/equationDialogUtils.js";
import {
  deleteMathNodeAtPosition,
  updateMathNodeAtPosition,
} from "./math/equationEditingUtils.js";
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

function getEditorSelectionJson(editor) {
  try {
    return editor?.state?.selection?.toJSON?.() ?? null;
  } catch {
    return null;
  }
}

function restoreEditorSelection(selectionJson) {
  return ({ tr }) => {
    if (!selectionJson) {
      return true;
    }

    try {
      tr.setSelection(Selection.fromJSON(tr.doc, selectionJson));
    } catch {
      return true;
    }

    return true;
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
  const [equationDialogRequest, setEquationDialogRequest] = useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  const objectUrlsRef = useRef(new Set());
  const savedSelectionRef = useRef(null);
  const lastContentKeyRef = useRef(getContentKey(getInitialContent(value)));
  const handleOpenEquationEdit = useCallback((request) => {
    setEquationDialogRequest(request);
  }, []);
  const extensions = useMemo(
    () => [
      ...createEditorExtensions({
        onEditEquation: handleOpenEquationEdit,
        placeholder,
      }),
      ...extraExtensions,
    ],
    [extraExtensions, handleOpenEquationEdit, placeholder],
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

  const handleOpenEquationDialog = useCallback(() => {
    if (!editor || readOnly) {
      return;
    }

    savedSelectionRef.current = getEditorSelectionJson(editor);
    setEquationDialogRequest(createInsertEquationRequest());
  }, [editor, readOnly]);

  const handleCloseEquationDialog = useCallback(() => {
    savedSelectionRef.current = null;
    setEquationDialogRequest(null);
  }, []);

  const handleSaveEquation = useCallback(
    ({ content, latex, request, type }) => {
      if (!editor || readOnly) {
        return {
          error: "The editor is read-only.",
          ok: false,
        };
      }

      if (request?.mode === EQUATION_DIALOG_MODES.EDIT) {
        return updateMathNodeAtPosition({
          editor,
          latex,
          request,
          type,
        });
      }

      editor
        .chain()
        .focus()
        .command(restoreEditorSelection(savedSelectionRef.current))
        .insertContent(content)
        .run();

      savedSelectionRef.current = null;
      return {
        error: "",
        ok: true,
      };
    },
    [editor, readOnly],
  );

  const handleDeleteEquation = useCallback(
    (request) => {
      if (!editor || readOnly) {
        return {
          error: "The editor is read-only.",
          ok: false,
        };
      }

      const result = deleteMathNodeAtPosition({
        editor,
        request,
      });

      if (result.ok) {
        savedSelectionRef.current = null;
      }

      return result;
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
          onOpenEquationDialog={handleOpenEquationDialog}
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
      <EquationDialog
        isOpen={Boolean(equationDialogRequest)}
        onClose={handleCloseEquationDialog}
        onDelete={handleDeleteEquation}
        onSave={handleSaveEquation}
        request={equationDialogRequest}
      />
    </div>
  );
}

export default RichTextEditor;
