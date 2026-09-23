import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ResizableImageNodeView from "./ResizableImageNodeView.jsx";

const IMAGE_ALIGNMENTS = new Set(["left", "center", "right"]);

function normalizeImageDimension(value) {
  const numericValue = Number.parseFloat(String(value ?? "").replace("px", ""));

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

function normalizeImageAlignment(value) {
  return IMAGE_ALIGNMENTS.has(value) ? value : "center";
}

function getImageAlignmentStyle(value) {
  const alignment = normalizeImageAlignment(value);

  if (alignment === "left") {
    return "display: block; float: left; margin: 0.35rem 1rem 0.75rem 0;";
  }

  if (alignment === "right") {
    return "display: block; float: right; margin: 0.35rem 0 0.75rem 1rem;";
  }

  return "clear: both; display: block; float: none; margin-left: auto; margin-right: auto;";
}

const ResizableImageNode = Image.extend({
  name: "image",

  addAttributes() {
    const parentAttributes = this.parent?.() ?? {};

    return {
      ...parentAttributes,
      align: {
        default: "center",
        parseHTML: (element) =>
          normalizeImageAlignment(
            element.getAttribute("data-align") ||
              element.getAttribute("align") ||
              element.style.textAlign,
          ),
        renderHTML: (attributes) => {
          const align = normalizeImageAlignment(attributes.align);

          return {
            "data-align": align,
            style: getImageAlignmentStyle(align),
          };
        },
      },
      width: {
        default: null,
        parseHTML: (element) =>
          normalizeImageDimension(
            element.getAttribute("width") || element.style.width,
          ),
        renderHTML: (attributes) => {
          const width = normalizeImageDimension(attributes.width);

          return width ? { width } : {};
        },
      },
      height: {
        default: null,
        parseHTML: (element) =>
          normalizeImageDimension(
            element.getAttribute("height") || element.style.height,
          ),
        renderHTML: (attributes) => {
          const height = normalizeImageDimension(attributes.height);

          return height ? { height } : {};
        },
      },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageNodeView);
  },
});

export default ResizableImageNode;
