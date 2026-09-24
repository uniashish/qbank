import { useMemo } from "react";
import { NodeViewWrapper } from "@tiptap/react";

import {
  MATH_BLOCK_NODE_NAME,
  getMathFallbackText,
  getMathPlainText,
  renderLatexToHtml,
} from "./mathUtils.js";

function setNodeSelection({ editor, getPos }) {
  if (!editor || !editor.isEditable || typeof getPos !== "function") {
    return;
  }

  const position = getPos();

  if (Number.isInteger(position)) {
    editor.chain().focus().setNodeSelection(position).run();
  }
}

function MathNodeView({ editor, getPos, node, selected = false }) {
  const isBlock = node.type.name === MATH_BLOCK_NODE_NAME;
  const isEditable = Boolean(editor?.isEditable);
  const latex = getMathPlainText(node.attrs);
  const fallbackText = getMathFallbackText(latex);
  const renderResult = useMemo(
    () => renderLatexToHtml(latex, { displayMode: isBlock }),
    [isBlock, latex],
  );
  const className = [
    "rich-text-editor-math-node",
    isBlock
      ? "rich-text-editor-math-node--block"
      : "rich-text-editor-math-node--inline",
    selected ? "rich-text-editor-math-node--selected" : "",
    renderResult.error ? "rich-text-editor-math-node--error" : "",
    !isEditable ? "rich-text-editor-math-node--readonly" : "",
  ]
    .filter(Boolean)
    .join(" ");

  function handleSelectMathNode(event) {
    if (!isEditable) {
      return;
    }

    event.preventDefault();
    setNodeSelection({ editor, getPos });
  }

  return (
    <NodeViewWrapper
      as={isBlock ? "div" : "span"}
      className={className}
      contentEditable={false}
      data-latex={latex}
      data-math-block={isBlock ? "true" : undefined}
      data-math-inline={isBlock ? undefined : "true"}
      onMouseDown={handleSelectMathNode}
      title={renderResult.error ? "Invalid LaTeX" : undefined}
    >
      {renderResult.error ? (
        <code className="rich-text-editor-math-node__fallback">
          {fallbackText}
        </code>
      ) : renderResult.html ? (
        <span
          className="rich-text-editor-math-node__rendered"
          dangerouslySetInnerHTML={{ __html: renderResult.html }}
        />
      ) : (
        <code className="rich-text-editor-math-node__fallback">
          {fallbackText}
        </code>
      )}
    </NodeViewWrapper>
  );
}

export default MathNodeView;
