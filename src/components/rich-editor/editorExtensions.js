import Placeholder from "@tiptap/extension-placeholder";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";

import MathBlockNode from "./math/MathBlockNode.js";
import MathInlineNode from "./math/MathInlineNode.js";
import "./math/math.css";
import ResizableImageNode from "./nodes/ResizableImageNode.js";

export const EMPTY_RICH_TEXT_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export const ACCEPTED_RICH_TEXT_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const ACCEPTED_RICH_TEXT_IMAGE_INPUT = [
  ...ACCEPTED_RICH_TEXT_IMAGE_TYPES,
].join(",");

export const MAX_RICH_TEXT_IMAGE_SIZE = 5 * 1024 * 1024;

export function validateRichTextImageFile(file) {
  if (!file) {
    return "Choose an image file.";
  }

  if (!ACCEPTED_RICH_TEXT_IMAGE_TYPES.has(file.type)) {
    return "Use a JPEG, PNG or WEBP image.";
  }

  if (file.size > MAX_RICH_TEXT_IMAGE_SIZE) {
    return "Image must be 5 MB or smaller.";
  }

  return "";
}

export function createEditorExtensions({ placeholder = "Enter content..." } = {}) {
  return [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Underline,
    TextAlign.configure({
      types: ["heading", "paragraph"],
      alignments: ["left", "center", "right", "justify"],
    }),
    Superscript,
    Subscript,
    MathInlineNode,
    MathBlockNode,
    ResizableImageNode.configure({
      allowBase64: false,
      inline: false,
      HTMLAttributes: {
        class: "rich-text-editor__image",
      },
    }),
    Table.configure({
      allowTableNodeSelection: true,
      HTMLAttributes: {
        class: "rich-text-editor__table",
      },
      renderWrapper: true,
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      dataAttribute: "placeholder",
      emptyEditorClass: "rich-text-editor__empty",
      emptyNodeClass: "rich-text-editor__empty-node",
      placeholder,
      showOnlyCurrent: true,
      showOnlyWhenEditable: true,
    }),
  ];
}
