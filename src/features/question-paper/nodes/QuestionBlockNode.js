import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import QuestionBlockView from "./QuestionBlockView.jsx";
import {
  DEFAULT_QUESTION_BLOCK_ATTRS,
  QUESTION_BLOCK_NODE_NAME,
  createQuestionBlock,
  getQuestionBlockPrompt,
  parseQuestionBlockSnapshot,
  stringifyQuestionBlockSnapshot,
} from "./questionBlockUtils.js";

function readNumberAttribute(element, name, fallback) {
  const value = Number(element.getAttribute(name));

  if (!Number.isSafeInteger(value) || value <= 0) {
    return fallback;
  }

  return value;
}

export function createQuestionBlockExtension(NodeViewComponent = QuestionBlockView) {
  return Node.create({
    name: QUESTION_BLOCK_NODE_NAME,

    atom: true,
    draggable: true,
    group: "block",
    isolating: true,
    selectable: true,

    addAttributes() {
      return {
        blockId: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.blockId,
          parseHTML: (element) => element.getAttribute("data-block-id") || "",
          renderHTML: (attributes) => ({
            "data-block-id": attributes.blockId,
          }),
        },
        questionId: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.questionId,
          parseHTML: (element) => element.getAttribute("data-question-id") || "",
          renderHTML: (attributes) => ({
            "data-question-id": attributes.questionId,
          }),
        },
        questionNumber: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.questionNumber,
          parseHTML: (element) =>
            element.getAttribute("data-question-number") || "",
          renderHTML: (attributes) => ({
            "data-question-number": attributes.questionNumber,
          }),
        },
        marks: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.marks,
          parseHTML: (element) =>
            readNumberAttribute(
              element,
              "data-marks",
              DEFAULT_QUESTION_BLOCK_ATTRS.marks,
            ),
          renderHTML: (attributes) => ({
            "data-marks": attributes.marks,
          }),
        },
        difficulty: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.difficulty,
          parseHTML: (element) =>
            element.getAttribute("data-difficulty") ||
            DEFAULT_QUESTION_BLOCK_ATTRS.difficulty,
          renderHTML: (attributes) => ({
            "data-difficulty": attributes.difficulty,
          }),
        },
        questionType: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.questionType,
          parseHTML: (element) =>
            element.getAttribute("data-question-type") || "",
          renderHTML: (attributes) => ({
            "data-question-type": attributes.questionType,
          }),
        },
        snapshot: {
          default: DEFAULT_QUESTION_BLOCK_ATTRS.snapshot,
          parseHTML: (element) =>
            parseQuestionBlockSnapshot(element.getAttribute("data-snapshot")),
          renderHTML: (attributes) => ({
            "data-snapshot": stringifyQuestionBlockSnapshot(attributes.snapshot),
          }),
        },
      };
    },

    parseHTML() {
      return [{ tag: "section[data-question-block]" }];
    },

    renderHTML({ HTMLAttributes, node }) {
      const attrs = createQuestionBlock(node.attrs);
      const prompt = getQuestionBlockPrompt(attrs.snapshot);
      const marksLabel = `${attrs.marks} mark${attrs.marks === 1 ? "" : "s"}`;

      return [
        "section",
        mergeAttributes(HTMLAttributes, {
          "data-question-block": "true",
          class: "question-block-static",
        }),
        [
          "p",
          { class: "question-block-static__prompt" },
          `Q${attrs.questionNumber || "?"}. ${prompt}`,
        ],
        ["p", { class: "question-block-static__marks" }, marksLabel],
      ];
    },

    addCommands() {
      return {
        insertQuestionBlock:
          (questionBlockInput) =>
          ({ commands }) =>
            commands.insertContent({
              attrs: createQuestionBlock(questionBlockInput),
              type: this.name,
            }),
      };
    },

    addNodeView() {
      return ReactNodeViewRenderer(NodeViewComponent);
    },
  });
}

const QuestionBlockNode = createQuestionBlockExtension();

export default QuestionBlockNode;
