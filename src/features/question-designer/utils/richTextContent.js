import {
  MATH_BLOCK_NODE_NAME,
  MATH_INLINE_NODE_NAME,
  getMathPlainText,
} from "../../../components/rich-editor/math/mathUtils.js";

export const EMPTY_RICH_TEXT_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const MEANINGFUL_NODE_TYPES = new Set(["table"]);
const MATH_NODE_TYPES = new Set([MATH_INLINE_NODE_NAME, MATH_BLOCK_NODE_NAME]);

export function cloneRichTextContent(content) {
  if (!content) {
    return null;
  }

  return JSON.parse(JSON.stringify(content));
}

function createParagraphFromText(text) {
  if (!text) {
    return { type: "paragraph" };
  }

  return {
    content: [{ text, type: "text" }],
    type: "paragraph",
  };
}

export function createRichTextDocumentFromText(value) {
  const text = String(value ?? "");
  const lines = text.split(/\r?\n/);
  const content = lines.length
    ? lines.map((line) => createParagraphFromText(line))
    : [{ type: "paragraph" }];

  return {
    content,
    type: "doc",
  };
}

export function isRichTextDocument(content) {
  return (
    content !== null &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    content.type === "doc" &&
    Array.isArray(content.content)
  );
}

export function normalizeRichTextContent(content, fallbackText = "") {
  if (isRichTextDocument(content)) {
    return cloneRichTextContent(content);
  }

  if (typeof content === "string") {
    return createRichTextDocumentFromText(content);
  }

  if (fallbackText !== null && fallbackText !== undefined) {
    return createRichTextDocumentFromText(fallbackText);
  }

  return cloneRichTextContent(EMPTY_RICH_TEXT_DOCUMENT);
}

export function hasMeaningfulRichTextContent(content) {
  if (!content) {
    return false;
  }

  if (typeof content === "string") {
    return content.trim().length > 0;
  }

  if (content.type === "text") {
    return String(content.text ?? "").trim().length > 0;
  }

  if (content.type === "image") {
    return String(content.attrs?.src ?? "").trim().length > 0;
  }

  if (MATH_NODE_TYPES.has(content.type)) {
    return getMathPlainText(content.attrs).trim().length > 0;
  }

  if (MEANINGFUL_NODE_TYPES.has(content.type)) {
    return true;
  }

  return Array.isArray(content.content)
    ? content.content.some((node) => hasMeaningfulRichTextContent(node))
    : false;
}

export function getRichTextPlainText(content) {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (content.type === "text") {
    return content.text ?? "";
  }

  if (content.type === "image") {
    return content.attrs?.alt ? `[Image: ${content.attrs.alt}]` : "[Image]";
  }

  if (MATH_NODE_TYPES.has(content.type)) {
    return getMathPlainText(content.attrs);
  }

  if (content.type === "table") {
    return "[Table]";
  }

  if (!Array.isArray(content.content)) {
    return "";
  }

  return content.content
    .map((node) => getRichTextPlainText(node))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
