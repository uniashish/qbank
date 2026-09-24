import { useEditorState } from "@tiptap/react";

import ToolbarButton from "./ToolbarButton.jsx";

const IMAGE_ALIGNMENTS = new Set(["left", "center", "right"]);

const DEFAULT_TOOLBAR_STATE = {
  alignment: "left",
  canAddColumn: false,
  canAddRow: false,
  canDeleteColumn: false,
  canDeleteRow: false,
  canDeleteTable: false,
  canRedo: false,
  canUndo: false,
  heading: "paragraph",
  isBold: false,
  isBulletList: false,
  isItalic: false,
  isImageActive: false,
  isNumberedList: false,
  isStrike: false,
  isSubscript: false,
  isSuperscript: false,
  isTableActive: false,
  isUnderline: false,
};

function normalizeImageAlignment(value) {
  return IMAGE_ALIGNMENTS.has(value) ? value : "center";
}

function SvgIcon({ children }) {
  return (
    <svg
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width="18"
    >
      {children}
    </svg>
  );
}

const icons = {
  addColumn: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </SvgIcon>
  ),
  addRow: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </SvgIcon>
  ),
  alignCenter: (
    <SvgIcon>
      <path d="M5 6h14" />
      <path d="M8 10h8" />
      <path d="M5 14h14" />
      <path d="M8 18h8" />
    </SvgIcon>
  ),
  alignJustify: (
    <SvgIcon>
      <path d="M4 6h16" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M4 18h16" />
    </SvgIcon>
  ),
  alignLeft: (
    <SvgIcon>
      <path d="M4 6h16" />
      <path d="M4 10h10" />
      <path d="M4 14h16" />
      <path d="M4 18h10" />
    </SvgIcon>
  ),
  alignRight: (
    <SvgIcon>
      <path d="M4 6h16" />
      <path d="M10 10h10" />
      <path d="M4 14h16" />
      <path d="M10 18h10" />
    </SvgIcon>
  ),
  bold: <span className="rich-text-editor-toolbar__text-icon rich-text-editor-toolbar__text-icon--bold">B</span>,
  bulletList: (
    <SvgIcon>
      <path d="M9 6h11" />
      <path d="M9 12h11" />
      <path d="M9 18h11" />
      <path d="M4 6h.01" />
      <path d="M4 12h.01" />
      <path d="M4 18h.01" />
    </SvgIcon>
  ),
  deleteColumn: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M10 5v14" />
      <path d="M14 5v14" />
      <path d="M8 12h8" />
    </SvgIcon>
  ),
  deleteRow: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M4 10h16" />
      <path d="M4 14h16" />
      <path d="M8 12h8" />
    </SvgIcon>
  ),
  deleteTable: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M9 9l6 6" />
      <path d="M15 9l-6 6" />
    </SvgIcon>
  ),
  image: (
    <SvgIcon>
      <rect height="14" rx="2" width="18" x="3" y="5" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m21 15-4.5-4.5L8 19" />
    </SvgIcon>
  ),
  italic: <span className="rich-text-editor-toolbar__text-icon rich-text-editor-toolbar__text-icon--italic">I</span>,
  equation: (
    <span className="rich-text-editor-toolbar__text-icon rich-text-editor-toolbar__text-icon--equation">
      Σ
    </span>
  ),
  numberedList: (
    <SvgIcon>
      <path d="M10 6h10" />
      <path d="M10 12h10" />
      <path d="M10 18h10" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M4 14h2l-2 4h2" />
    </SvgIcon>
  ),
  redo: (
    <SvgIcon>
      <path d="m15 9 4 4-4 4" />
      <path d="M5 11a6 6 0 0 1 10.5-3.95L19 13" />
    </SvgIcon>
  ),
  strike: <span className="rich-text-editor-toolbar__text-icon rich-text-editor-toolbar__text-icon--strike">S</span>,
  subscript: (
    <span className="rich-text-editor-toolbar__script-icon">
      x<sub>2</sub>
    </span>
  ),
  superscript: (
    <span className="rich-text-editor-toolbar__script-icon">
      x<sup>2</sup>
    </span>
  ),
  table: (
    <SvgIcon>
      <path d="M4 5h16v14H4z" />
      <path d="M4 10h16" />
      <path d="M4 15h16" />
      <path d="M10 5v14" />
      <path d="M16 5v14" />
    </SvgIcon>
  ),
  underline: <span className="rich-text-editor-toolbar__text-icon rich-text-editor-toolbar__text-icon--underline">U</span>,
  undo: (
    <SvgIcon>
      <path d="m9 9-4 4 4 4" />
      <path d="M19 11A6 6 0 0 0 8.5 7.05L5 13" />
    </SvgIcon>
  ),
};

function getToolbarState(editor) {
  if (!editor) {
    return DEFAULT_TOOLBAR_STATE;
  }

  const isAlignCenter = editor.isActive({ textAlign: "center" });
  const isAlignRight = editor.isActive({ textAlign: "right" });
  const isAlignJustify = editor.isActive({ textAlign: "justify" });
  const isImageActive = editor.isActive("image");
  const imageAlignment = normalizeImageAlignment(
    editor.getAttributes("image")?.align,
  );
  const headingLevel = [1, 2, 3].find((level) =>
    editor.isActive("heading", { level }),
  );

  return {
    alignment: isImageActive
      ? imageAlignment
      : isAlignCenter
        ? "center"
        : isAlignRight
          ? "right"
          : isAlignJustify
            ? "justify"
            : "left",
    canAddColumn: editor.can().addColumnAfter(),
    canAddRow: editor.can().addRowAfter(),
    canDeleteColumn: editor.can().deleteColumn(),
    canDeleteRow: editor.can().deleteRow(),
    canDeleteTable: editor.can().deleteTable(),
    canRedo: editor.can().redo(),
    canUndo: editor.can().undo(),
    heading: headingLevel ? String(headingLevel) : "paragraph",
    isBold: editor.isActive("bold"),
    isBulletList: editor.isActive("bulletList"),
    isImageActive,
    isItalic: editor.isActive("italic"),
    isNumberedList: editor.isActive("orderedList"),
    isStrike: editor.isActive("strike"),
    isSubscript: editor.isActive("subscript"),
    isSuperscript: editor.isActive("superscript"),
    isTableActive: editor.isActive("table"),
    isUnderline: editor.isActive("underline"),
  };
}

function EditorToolbar({
  editor,
  onOpenEquationDialog,
  onOpenImageDialog,
  onOpenTableDialog,
  readOnly = false,
}) {
  const toolbarState =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => getToolbarState(currentEditor),
    }) ?? DEFAULT_TOOLBAR_STATE;

  const isDisabled = readOnly || !editor;

  const runCommand = (command) => {
    if (!editor || readOnly) {
      return;
    }

    command(editor.chain().focus()).run();
  };

  const runAlignmentCommand = (alignment) => {
    if (!editor || readOnly) {
      return;
    }

    if (toolbarState.isImageActive) {
      if (!IMAGE_ALIGNMENTS.has(alignment)) {
        return;
      }

      editor
        .chain()
        .focus()
        .updateAttributes("image", { align: alignment })
        .run();
      return;
    }

    editor.chain().focus().setTextAlign(alignment).run();
  };

  const handleHeadingChange = (event) => {
    if (!editor || readOnly) {
      return;
    }

    const nextHeading = event.target.value;
    const chain = editor.chain().focus();

    if (nextHeading === "paragraph") {
      chain.setParagraph().run();
      return;
    }

    chain.setHeading({ level: Number(nextHeading) }).run();
  };

  return (
    <div aria-label="Rich text editor toolbar" className="rich-text-editor-toolbar" role="toolbar">
      <div aria-label="History" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canUndo}
          icon={icons.undo}
          label="Undo"
          onClick={() => runCommand((chain) => chain.undo())}
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canRedo}
          icon={icons.redo}
          label="Redo"
          onClick={() => runCommand((chain) => chain.redo())}
        />
      </div>

      <div aria-label="Text style" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          active={toolbarState.isBold}
          disabled={isDisabled}
          icon={icons.bold}
          label="Bold"
          onClick={() => runCommand((chain) => chain.toggleBold())}
        />
        <ToolbarButton
          active={toolbarState.isItalic}
          disabled={isDisabled}
          icon={icons.italic}
          label="Italic"
          onClick={() => runCommand((chain) => chain.toggleItalic())}
        />
        <ToolbarButton
          active={toolbarState.isUnderline}
          disabled={isDisabled}
          icon={icons.underline}
          label="Underline"
          onClick={() => runCommand((chain) => chain.toggleUnderline())}
        />
        <ToolbarButton
          active={toolbarState.isStrike}
          disabled={isDisabled}
          icon={icons.strike}
          label="Strikethrough"
          onClick={() => runCommand((chain) => chain.toggleStrike())}
        />
      </div>

      <div aria-label="Headings" className="rich-text-editor-toolbar__group" role="group">
        <label className="rich-text-editor-toolbar__select-label" htmlFor="rich-editor-heading">
          <span className="sr-only">Heading level</span>
          <select
            className="rich-text-editor-toolbar__select"
            disabled={isDisabled}
            id="rich-editor-heading"
            onChange={handleHeadingChange}
            title="Heading level"
            value={toolbarState.heading}
          >
            <option value="paragraph">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>
        </label>
      </div>

      <div aria-label="Lists" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          active={toolbarState.isBulletList}
          disabled={isDisabled}
          icon={icons.bulletList}
          label="Bulleted list"
          onClick={() => runCommand((chain) => chain.toggleBulletList())}
        />
        <ToolbarButton
          active={toolbarState.isNumberedList}
          disabled={isDisabled}
          icon={icons.numberedList}
          label="Numbered list"
          onClick={() => runCommand((chain) => chain.toggleOrderedList())}
        />
      </div>

      <div aria-label="Alignment" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          active={toolbarState.alignment === "left"}
          disabled={isDisabled}
          icon={icons.alignLeft}
          label="Align left"
          onClick={() => runAlignmentCommand("left")}
        />
        <ToolbarButton
          active={toolbarState.alignment === "center"}
          disabled={isDisabled}
          icon={icons.alignCenter}
          label="Align center"
          onClick={() => runAlignmentCommand("center")}
        />
        <ToolbarButton
          active={toolbarState.alignment === "right"}
          disabled={isDisabled}
          icon={icons.alignRight}
          label="Align right"
          onClick={() => runAlignmentCommand("right")}
        />
        <ToolbarButton
          active={!toolbarState.isImageActive && toolbarState.alignment === "justify"}
          disabled={isDisabled || toolbarState.isImageActive}
          icon={icons.alignJustify}
          label="Justify"
          onClick={() => runAlignmentCommand("justify")}
        />
      </div>

      <div aria-label="Script" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          active={toolbarState.isSuperscript}
          disabled={isDisabled}
          icon={icons.superscript}
          label="Superscript"
          onClick={() => runCommand((chain) => chain.toggleSuperscript())}
        />
        <ToolbarButton
          active={toolbarState.isSubscript}
          disabled={isDisabled}
          icon={icons.subscript}
          label="Subscript"
          onClick={() => runCommand((chain) => chain.toggleSubscript())}
        />
      </div>

      <div aria-label="Insert" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          disabled={isDisabled}
          icon={icons.equation}
          label="Insert Equation"
          onClick={onOpenEquationDialog}
        />
        <ToolbarButton
          disabled={isDisabled}
          icon={icons.image}
          label="Insert image"
          onClick={onOpenImageDialog}
        />
        <ToolbarButton
          disabled={isDisabled}
          icon={icons.table}
          label="Insert table"
          onClick={onOpenTableDialog}
        />
      </div>

      <div aria-label="Table editing" className="rich-text-editor-toolbar__group" role="group">
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canAddRow}
          icon={icons.addRow}
          label="Add row below"
          onClick={() => runCommand((chain) => chain.addRowAfter())}
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canDeleteRow}
          icon={icons.deleteRow}
          label="Delete row"
          onClick={() => runCommand((chain) => chain.deleteRow())}
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canAddColumn}
          icon={icons.addColumn}
          label="Add column after"
          onClick={() => runCommand((chain) => chain.addColumnAfter())}
        />
        <ToolbarButton
          disabled={isDisabled || !toolbarState.canDeleteColumn}
          icon={icons.deleteColumn}
          label="Delete column"
          onClick={() => runCommand((chain) => chain.deleteColumn())}
        />
        <ToolbarButton
          active={toolbarState.isTableActive}
          disabled={isDisabled || !toolbarState.canDeleteTable}
          icon={icons.deleteTable}
          label="Delete table"
          onClick={() => runCommand((chain) => chain.deleteTable())}
        />
      </div>
    </div>
  );
}

export default EditorToolbar;
