import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import MathNodeView from "./MathNodeView.jsx";
import {
  MATH_BLOCK_NODE_NAME,
  getMathPlainText,
  normalizeMathAttributes,
} from "./mathUtils.js";

const MathBlockNode = Node.create({
  name: MATH_BLOCK_NODE_NAME,

  atom: true,
  draggable: true,
  group: "block",
  isolating: true,
  selectable: true,

  addOptions() {
    return {
      onEditEquation: null,
    };
  },

  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) =>
          element.getAttribute("data-latex") || element.textContent || "",
        renderHTML: (attributes) => ({
          "data-latex": attributes.latex,
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "div[data-math-block]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = normalizeMathAttributes(node.attrs);

    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-latex": attrs.latex,
        "data-math-block": "true",
        class: "rich-text-editor-math-node rich-text-editor-math-node--block",
      }),
      getMathPlainText(attrs),
    ];
  },

  addCommands() {
    return {
      insertMathBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({
            attrs: normalizeMathAttributes(attrs),
            type: this.name,
          }),
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathNodeView);
  },
});

export default MathBlockNode;
