import {
  hasMeaningfulRichTextContent,
  normalizeRichTextContent,
} from "../../question-designer/utils/richTextContent.js";

export const QUESTION_BLOCK_NODE_NAME = "questionBlock";

export const DEFAULT_QUESTION_BLOCK_ATTRS = {
  blockId: "",
  difficulty: "medium",
  marks: 1,
  questionId: "",
  questionNumber: "",
  questionType: "",
  snapshot: null,
};

function createFallbackId() {
  return `question-block-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function createQuestionBlockId() {
  return globalThis.crypto?.randomUUID?.() ?? createFallbackId();
}

export function cloneJsonSafe(value) {
  if (value == null) {
    return null;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return null;
  }
}

export function normalizePositiveWholeNumber(value, fallback = 1) {
  const numericValue = Number(value);

  if (!Number.isSafeInteger(numericValue) || numericValue <= 0) {
    return fallback;
  }

  return numericValue;
}

export function createQuestionBlock({
  blockId,
  difficulty = DEFAULT_QUESTION_BLOCK_ATTRS.difficulty,
  marks = DEFAULT_QUESTION_BLOCK_ATTRS.marks,
  questionId = DEFAULT_QUESTION_BLOCK_ATTRS.questionId,
  questionNumber = DEFAULT_QUESTION_BLOCK_ATTRS.questionNumber,
  questionType = DEFAULT_QUESTION_BLOCK_ATTRS.questionType,
  snapshot = DEFAULT_QUESTION_BLOCK_ATTRS.snapshot,
} = {}) {
  return {
    blockId: blockId || createQuestionBlockId(),
    difficulty: String(difficulty || DEFAULT_QUESTION_BLOCK_ATTRS.difficulty),
    marks: normalizePositiveWholeNumber(marks),
    questionId: String(questionId || ""),
    questionNumber: String(questionNumber || ""),
    questionType: String(questionType || ""),
    snapshot: cloneJsonSafe(snapshot),
  };
}

export function createQuestionSnapshot(question = {}) {
  return cloneJsonSafe({
    answerData: question.answerData ?? null,
    difficulty: question.difficulty ?? "",
    image: question.image ?? question.questionImage ?? null,
    instructions: question.instructions ?? "",
    prompt: question.prompt ?? "",
    promptContent: question.promptContent ?? null,
    questionType: question.questionType ?? "",
    tags: question.tags ?? [],
    topicName: question.topicName ?? "",
  });
}

export function createQuestionBlockFromQuestion(question, questionNumber) {
  return createQuestionBlock({
    difficulty: question.difficulty,
    marks: question.marks,
    questionId: question.id,
    questionNumber,
    questionType: question.questionType,
    snapshot: createQuestionSnapshot(question),
  });
}

export function createQuestionBlockNode(questionBlockInput) {
  return {
    attrs: createQuestionBlock(questionBlockInput),
    type: QUESTION_BLOCK_NODE_NAME,
  };
}

export function getQuestionBlockPrompt(snapshot) {
  const prompt = snapshot?.prompt;

  if (typeof prompt === "string" && prompt.trim()) {
    return prompt.trim();
  }

  return "Question prompt unavailable.";
}

export function getQuestionBlockPromptContent(snapshot) {
  const answerQuestionContent = snapshot?.answerData?.questionContent;

  if (hasMeaningfulRichTextContent(answerQuestionContent)) {
    return normalizeRichTextContent(answerQuestionContent);
  }

  if (hasMeaningfulRichTextContent(snapshot?.promptContent)) {
    return normalizeRichTextContent(snapshot.promptContent);
  }

  return normalizeRichTextContent(getQuestionBlockPrompt(snapshot));
}

export function extractQuestionBlocks(documentContent) {
  const questionBlocks = [];

  function visitNode(node) {
    if (!node) {
      return;
    }

    if (node.type === QUESTION_BLOCK_NODE_NAME) {
      questionBlocks.push(
        createQuestionBlock({
          ...node.attrs,
          questionNumber: String(questionBlocks.length + 1),
        }),
      );
      return;
    }

    node.content?.forEach(visitNode);
  }

  visitNode(documentContent);
  return questionBlocks;
}

export function extractQuestionBlocksFromDocument(documentContent) {
  return extractQuestionBlocks(documentContent);
}

export function renumberQuestionBlocks(documentContent) {
  let nextQuestionNumber = 1;
  let changed = false;

  function visitNode(node) {
    if (!node) {
      return node;
    }

    if (node.type === QUESTION_BLOCK_NODE_NAME) {
      const questionNumber = String(nextQuestionNumber);
      nextQuestionNumber += 1;

      if (node.attrs?.questionNumber === questionNumber) {
        return node;
      }

      changed = true;

      return {
        ...node,
        attrs: {
          ...(node.attrs ?? {}),
          questionNumber,
        },
      };
    }

    if (!Array.isArray(node.content)) {
      return node;
    }

    const nextContent = node.content.map(visitNode);

    if (nextContent.every((childNode, index) => childNode === node.content[index])) {
      return node;
    }

    return {
      ...node,
      content: nextContent,
    };
  }

  const renumberedDocument = visitNode(documentContent);

  return {
    changed,
    documentContent: renumberedDocument,
    questionBlocks: extractQuestionBlocks(renumberedDocument),
  };
}

export function parseQuestionBlockSnapshot(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function stringifyQuestionBlockSnapshot(snapshot) {
  if (!snapshot) {
    return undefined;
  }

  try {
    return JSON.stringify(snapshot);
  } catch {
    return undefined;
  }
}

function getNodePosition(getPos) {
  if (typeof getPos !== "function") {
    return null;
  }

  const position = getPos();
  return typeof position === "number" ? position : null;
}

export function canMoveQuestionBlock({ direction, editor, getPos }) {
  const position = getNodePosition(getPos);

  if (!editor || position == null) {
    return false;
  }

  const resolvedPosition = editor.state.doc.resolve(position);
  const parent = resolvedPosition.parent;
  const nodeIndex = resolvedPosition.index();

  if (direction === "up") {
    return nodeIndex > 0;
  }

  if (direction === "down") {
    return nodeIndex < parent.childCount - 1;
  }

  return false;
}

export function moveQuestionBlock({ direction, editor, getPos }) {
  const position = getNodePosition(getPos);

  if (!editor || position == null) {
    return false;
  }

  const node = editor.state.doc.nodeAt(position);

  if (!node) {
    return false;
  }

  const resolvedPosition = editor.state.doc.resolve(position);
  const parent = resolvedPosition.parent;
  const nodeIndex = resolvedPosition.index();

  if (direction === "up") {
    if (nodeIndex === 0) {
      return false;
    }

    const previousNode = parent.child(nodeIndex - 1);
    const targetPosition = position - previousNode.nodeSize;
    const transaction = editor.state.tr
      .delete(position, position + node.nodeSize)
      .insert(targetPosition, node)
      .scrollIntoView();

    editor.view.dispatch(transaction);
    editor.commands.focus();
    return true;
  }

  if (direction === "down") {
    if (nodeIndex >= parent.childCount - 1) {
      return false;
    }

    const nextNode = parent.child(nodeIndex + 1);
    const transaction = editor.state.tr
      .delete(position, position + node.nodeSize)
      .insert(position + nextNode.nodeSize, node)
      .scrollIntoView();

    editor.view.dispatch(transaction);
    editor.commands.focus();
    return true;
  }

  return false;
}
