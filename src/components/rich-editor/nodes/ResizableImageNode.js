import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ResizableImageNodeView from "./ResizableImageNodeView.jsx";

function normalizeImageDimension(value) {
  const numericValue = Number.parseFloat(String(value ?? "").replace("px", ""));

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

const ResizableImageNode = Image.extend({
  name: "image",

  addAttributes() {
    const parentAttributes = this.parent?.() ?? {};

    return {
      ...parentAttributes,
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
