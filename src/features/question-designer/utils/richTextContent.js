export const EMPTY_RICH_TEXT_DOCUMENT = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const MEANINGFUL_NODE_TYPES = new Set(["table"]);

export function cloneRichTextContent(content) {
  if (!content) {
    return null;
  }

  return JSON.parse(JSON.stringify(content));
}

export function hasMeaningfulRichTextContent(content) {
  if (!content) {
    return false;
  }

  if (content.type === "text") {
    return String(content.text ?? "").trim().length > 0;
  }

  if (content.type === "image") {
    return String(content.attrs?.src ?? "").trim().length > 0;
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

  if (content.type === "text") {
    return content.text ?? "";
  }

  if (content.type === "image") {
    return content.attrs?.alt ? `[Image: ${content.attrs.alt}]` : "[Image]";
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
