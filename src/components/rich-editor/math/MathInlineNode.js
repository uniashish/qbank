import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import MathNodeView from "./MathNodeView.jsx";
import {
  MATH_INLINE_NODE_NAME,
  getMathPlainText,
  normalizeMathAttributes,
} from "./mathUtils.js";

const MathInlineNode = Node.create({
  name: MATH_INLINE_NODE_NAME,

  atom: true,
  group: "inline",
  inline: true,
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
    return [{ tag: "span[data-math-inline]" }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const attrs = normalizeMathAttributes(node.attrs);

    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-latex": attrs.latex,
        "data-math-inline": "true",
        class: "rich-text-editor-math-node rich-text-editor-math-node--inline",
      }),
      getMathPlainText(attrs),
    ];
  },

  addCommands() {
    return {
      insertMathInline:
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

export default MathInlineNode;
