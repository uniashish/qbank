import { Fragment } from "@tiptap/pm/model";
import { TextSelection } from "@tiptap/pm/state";

export const PAPER_INSERT_HORIZONTAL_RULE_NODE = "horizontalRule";

function isEmptyParagraphNode(node) {
  return node?.type?.name === "paragraph" && node.content.size === 0;
}

function getTopLevelEmptyParagraphs(doc) {
  const paragraphs = [];

  doc.forEach((node, position, index) => {
    if (!isEmptyParagraphNode(node)) {
      return;
    }

    paragraphs.push({
      index,
      nodeSize: node.nodeSize,
      pos: position,
    });
  });

  return paragraphs;
}

function isSelectionInsideNode(selection, paragraph) {
  return (
    selection.from >= paragraph.pos &&
    selection.from <= paragraph.pos + paragraph.nodeSize
  );
}

function getTrailingEmptyParagraph(doc, paragraphs) {
  return paragraphs.find(
    (paragraph) => paragraph.pos + paragraph.nodeSize === doc.content.size,
  );
}

export function findActiveEmptyParagraph(editor) {
  if (!editor?.state?.doc) {
    return null;
  }

  const { doc, selection } = editor.state;
  const paragraphs = getTopLevelEmptyParagraphs(doc);

  if (paragraphs.length === 0) {
    return null;
  }

  const selectedParagraph = paragraphs.find((paragraph) =>
    isSelectionInsideNode(selection, paragraph),
  );

  return selectedParagraph ?? getTrailingEmptyParagraph(doc, paragraphs) ?? paragraphs[0];
}

function resolveInsertionPoint(editor, insertionPoint) {
  if (!editor?.state?.doc) {
    return null;
  }

  const position = Number(insertionPoint?.pos);
  const node = Number.isSafeInteger(position)
    ? editor.state.doc.nodeAt(position)
    : null;

  if (isEmptyParagraphNode(node)) {
    return {
      nodeSize: node.nodeSize,
      pos: position,
    };
  }

  return findActiveEmptyParagraph(editor);
}

function createContentNodes(editor, content) {
  const contentItems = Array.isArray(content) ? content : [content];

  return contentItems
    .filter(Boolean)
    .map((node) =>
      typeof node.type?.name === "string"
        ? node
        : editor.state.schema.nodeFromJSON(node),
    );
}

export function ensureTrailingEmptyParagraph(editor) {
  if (!editor?.state?.schema?.nodes?.paragraph || !editor?.view) {
    return null;
  }

  const { doc, schema, tr } = editor.state;
  const lastNode = doc.lastChild;

  if (isEmptyParagraphNode(lastNode)) {
    return {
      changed: false,
      pos: doc.content.size - lastNode.nodeSize,
    };
  }

  const insertPosition = doc.content.size;
  const paragraph = schema.nodes.paragraph.create();

  editor.view.dispatch(tr.insert(insertPosition, paragraph));

  return {
    changed: true,
    pos: insertPosition,
  };
}

export function insertAtPaperInsertionPoint({
  content,
  editor,
  insertionPoint,
} = {}) {
  if (!editor?.state?.schema || !editor?.view || !editor.isEditable) {
    return null;
  }

  const contentNodes = createContentNodes(editor, content);

  if (contentNodes.length === 0) {
    return null;
  }

  const paragraphType = editor.state.schema.nodes.paragraph;

  if (!paragraphType) {
    return null;
  }

  let transaction = editor.state.tr;
  const resolvedPoint = resolveInsertionPoint(editor, insertionPoint);
  let insertionPosition = resolvedPoint?.pos;

  if (!Number.isSafeInteger(insertionPosition)) {
    insertionPosition = transaction.doc.content.size;
    transaction = transaction.insert(
      insertionPosition,
      paragraphType.create(),
    );
  }

  const targetNode = transaction.doc.nodeAt(insertionPosition);

  if (!isEmptyParagraphNode(targetNode)) {
    return null;
  }

  const trailingParagraph = paragraphType.create();
  const insertFragment = Fragment.fromArray([...contentNodes, trailingParagraph]);
  const trailingParagraphPosition =
    insertionPosition +
    contentNodes.reduce((position, node) => position + node.nodeSize, 0);

  transaction = transaction
    .replaceWith(
      insertionPosition,
      insertionPosition + targetNode.nodeSize,
      insertFragment,
    )
    .setSelection(
      TextSelection.create(transaction.doc, trailingParagraphPosition + 1),
    )
    .scrollIntoView();

  editor.view.dispatch(transaction);
  editor.commands.focus();

  return {
    trailingParagraphPos: trailingParagraphPosition,
  };
}

export function createHorizontalRuleNode() {
  return {
    type: PAPER_INSERT_HORIZONTAL_RULE_NODE,
  };
}
