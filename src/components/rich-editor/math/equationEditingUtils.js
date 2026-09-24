import { Fragment } from "@tiptap/pm/model";
import { NodeSelection, Selection } from "@tiptap/pm/state";

import {
  getEquationNodeType,
  isMathNodeType,
  normalizeEquationLatex,
} from "./equationDialogUtils.js";
import {
  MATH_BLOCK_NODE_NAME,
  MATH_INLINE_NODE_NAME,
  getMathPlainText,
  normalizeMathAttributes,
} from "./mathUtils.js";

const STALE_EQUATION_ERROR =
  "This equation was changed or removed. Close the dialog and reopen it to edit.";
const UPDATE_EQUATION_ERROR = "Unable to update this equation.";
const DELETE_EQUATION_ERROR = "Unable to delete this equation.";

function createResult(ok, error = "") {
  return {
    error,
    ok,
  };
}

function createMathNode(schema, nodeType, latex) {
  const type = schema.nodes[nodeType];

  if (!type) {
    return null;
  }

  return type.create(normalizeMathAttributes({ latex }));
}

function getVerifiedMathEditTarget(editor, request) {
  if (
    !editor ||
    !Number.isInteger(request?.position) ||
    !isMathNodeType(request?.nodeType)
  ) {
    return {
      error: STALE_EQUATION_ERROR,
      node: null,
      position: null,
    };
  }

  const node = editor.state.doc.nodeAt(request.position);

  if (
    !node ||
    node.type.name !== request.nodeType ||
    !isMathNodeType(node.type.name) ||
    getMathPlainText(node.attrs) !== String(request.latex ?? "")
  ) {
    return {
      error: STALE_EQUATION_ERROR,
      node: null,
      position: null,
    };
  }

  return {
    error: "",
    node,
    position: request.position,
  };
}

function focusEditor(editor) {
  editor.view.focus();
}

function setNodeSelection(tr, position) {
  if (!Number.isInteger(position)) {
    return;
  }

  try {
    tr.setSelection(NodeSelection.create(tr.doc, position));
  } catch {
    const safePosition = Math.min(Math.max(position, 0), tr.doc.content.size);

    try {
      tr.setSelection(Selection.near(tr.doc.resolve(safePosition)));
    } catch {
      // Keep the transaction valid even if the converted position is no longer selectable.
    }
  }
}

function setNearSelection(tr, position) {
  const safePosition = Math.min(Math.max(position, 0), tr.doc.content.size);

  try {
    tr.setSelection(Selection.near(tr.doc.resolve(safePosition), -1));
  } catch {
    try {
      tr.setSelection(Selection.near(tr.doc.resolve(safePosition)));
    } catch {
      // Leave the default mapped selection in place.
    }
  }
}

function dispatchTransaction(editor, tr, selectionPosition = null) {
  if (Number.isInteger(selectionPosition)) {
    setNodeSelection(tr, selectionPosition);
  }

  editor.view.dispatch(tr.scrollIntoView());
  focusEditor(editor);
  return createResult(true);
}

function createTextBlock(parent, content, includeEmpty) {
  if (!includeEmpty && content.size === 0) {
    return null;
  }

  return parent.type.create(parent.attrs, content, parent.marks);
}

function getInlineToBlockReplacement({
  blockNode,
  container,
  parent,
  parentIndex,
  position,
}) {
  const parentOffset = position.parentOffset;
  const beforeContent = parent.content.cut(0, parentOffset);
  const afterContent = parent.content.cut(parentOffset + 1);
  const includeBefore = beforeContent.size > 0;
  const includeAfter = afterContent.size > 0;
  const candidates = [
    { emptyAfter: false, emptyBefore: false },
    { emptyAfter: false, emptyBefore: true },
    { emptyAfter: true, emptyBefore: false },
    { emptyAfter: true, emptyBefore: true },
  ];

  for (const candidate of candidates) {
    const replacements = [
      createTextBlock(parent, beforeContent, includeBefore || candidate.emptyBefore),
      blockNode,
      createTextBlock(parent, afterContent, includeAfter || candidate.emptyAfter),
    ].filter(Boolean);
    const fragment = Fragment.fromArray(replacements);

    if (!container.canReplace(parentIndex, parentIndex + 1, fragment)) {
      continue;
    }

    return {
      fragment,
      mathOffset: replacements
        .slice(0, replacements.indexOf(blockNode))
        .reduce((offset, node) => offset + node.nodeSize, 0),
    };
  }

  return null;
}

function convertInlineNodeToBlock({ editor, latex, position }) {
  const { state } = editor;
  const blockNode = createMathNode(state.schema, MATH_BLOCK_NODE_NAME, latex);

  if (!blockNode) {
    return createResult(false, UPDATE_EQUATION_ERROR);
  }

  try {
    const $position = state.doc.resolve(position);
    const parentDepth = $position.depth;
    const parent = $position.parent;

    if (parentDepth < 1 || !parent.inlineContent) {
      return createResult(false, UPDATE_EQUATION_ERROR);
    }

    const container = $position.node(parentDepth - 1);
    const parentIndex = $position.index(parentDepth - 1);
    const replacement = getInlineToBlockReplacement({
      blockNode,
      container,
      parent,
      parentIndex,
      position: $position,
    });

    if (!replacement) {
      return createResult(false, UPDATE_EQUATION_ERROR);
    }

    const parentFrom = $position.before(parentDepth);
    const parentTo = $position.after(parentDepth);
    const mathPosition = parentFrom + replacement.mathOffset;
    const tr = state.tr.replaceWith(
      parentFrom,
      parentTo,
      replacement.fragment,
    );

    return dispatchTransaction(editor, tr, mathPosition);
  } catch {
    return createResult(false, UPDATE_EQUATION_ERROR);
  }
}

function convertBlockNodeToInline({ editor, latex, node, position }) {
  const { state } = editor;
  const inlineNode = createMathNode(state.schema, MATH_INLINE_NODE_NAME, latex);
  const paragraphType = state.schema.nodes.paragraph;

  if (!inlineNode || !paragraphType) {
    return createResult(false, UPDATE_EQUATION_ERROR);
  }

  try {
    const $position = state.doc.resolve(position);
    const parent = $position.parent;
    const nodeIndex = $position.index();
    const paragraphNode = paragraphType.create(null, inlineNode);
    const paragraphFragment = Fragment.from(paragraphNode);

    if (!parent.canReplace(nodeIndex, nodeIndex + 1, paragraphFragment)) {
      return createResult(false, UPDATE_EQUATION_ERROR);
    }

    const tr = state.tr.replaceWith(
      position,
      position + node.nodeSize,
      paragraphNode,
    );

    return dispatchTransaction(editor, tr, position + 1);
  } catch {
    return createResult(false, UPDATE_EQUATION_ERROR);
  }
}

export function updateMathNodeAtPosition({ editor, latex, request, type }) {
  const target = getVerifiedMathEditTarget(editor, request);

  if (!target.node) {
    return createResult(false, target.error);
  }

  const nextLatex = normalizeEquationLatex(latex);
  const nextNodeType = getEquationNodeType(type);
  const { node, position } = target;

  if (node.type.name === nextNodeType) {
    if (getMathPlainText(node.attrs) === nextLatex) {
      return createResult(true);
    }

    try {
      const tr = editor.state.tr.setNodeMarkup(
        position,
        editor.state.schema.nodes[nextNodeType],
        {
          ...node.attrs,
          latex: nextLatex,
        },
        node.marks,
      );

      return dispatchTransaction(editor, tr, position);
    } catch {
      return createResult(false, UPDATE_EQUATION_ERROR);
    }
  }

  if (
    node.type.name === MATH_INLINE_NODE_NAME &&
    nextNodeType === MATH_BLOCK_NODE_NAME
  ) {
    return convertInlineNodeToBlock({
      editor,
      latex: nextLatex,
      position,
    });
  }

  if (
    node.type.name === MATH_BLOCK_NODE_NAME &&
    nextNodeType === MATH_INLINE_NODE_NAME
  ) {
    return convertBlockNodeToInline({
      editor,
      latex: nextLatex,
      node,
      position,
    });
  }

  return createResult(false, UPDATE_EQUATION_ERROR);
}

export function deleteMathNodeAtPosition({ editor, request }) {
  const target = getVerifiedMathEditTarget(editor, request);

  if (!target.node) {
    return createResult(false, target.error);
  }

  const { node, position } = target;

  try {
    const tr = editor.state.tr.delete(position, position + node.nodeSize);

    if (tr.doc.childCount === 0) {
      const paragraph = editor.state.schema.nodes.paragraph?.createAndFill();

      if (paragraph) {
        tr.insert(0, paragraph);
      }
    }

    setNearSelection(tr, position);
    editor.view.dispatch(tr.scrollIntoView());
    focusEditor(editor);
    return createResult(true);
  } catch {
    return createResult(false, DELETE_EQUATION_ERROR);
  }
}
