import {
  MATH_BLOCK_NODE_NAME,
  MATH_INLINE_NODE_NAME,
  getMathPlainText,
} from "../../../../../components/rich-editor/math/mathUtils.js";

const RICH_TEXT_CONTAINER_TYPES = new Set(["doc", "listItem"]);
const TABLE_CELL_TYPES = new Set(["tableCell", "tableHeader"]);
const TABLE_ROW_TYPE = "tableRow";
const IMAGE_ALIGN_VALUES = new Set(["center", "left", "right"]);
const TEXT_ALIGN_VALUES = new Set(["center", "justify", "left", "right"]);

function cloneJson(value, fallback = null) {
  if (value == null) {
    return fallback;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function createId(prefix, index) {
  return `${prefix}-${index + 1}`;
}

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();

  return text || fallback;
}

function normalizePositiveNumber(value, fallback = 0) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0
    ? numericValue
    : fallback;
}

function normalizeOptionalPositiveNumber(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

function hasMark(node, markType) {
  return Array.isArray(node?.marks)
    ? node.marks.some((mark) => mark?.type === markType)
    : false;
}

function getTextAlign(attrs = {}) {
  const textAlign = normalizeText(attrs.textAlign || attrs.align || attrs.textAlignment);

  return TEXT_ALIGN_VALUES.has(textAlign) ? textAlign : "";
}

function getImageAlign(attrs = {}) {
  const align = normalizeText(attrs.align || attrs.textAlign || attrs.textAlignment);

  return IMAGE_ALIGN_VALUES.has(align) ? align : "center";
}

function getImageSource(image = {}) {
  if (!image) {
    return "";
  }

  return normalizeText(
    image.downloadUrl || image.url || image.src || image.previewUrl,
  );
}

export function normalizeRichTextImage(image, fallbackAlt = "Question image") {
  const src = getImageSource(image);

  if (!src) {
    return null;
  }

  return {
    align: getImageAlign(image),
    alt: normalizeText(image?.alt || image?.name || image?.title, fallbackAlt),
    height: normalizeOptionalPositiveNumber(image?.height),
    src,
    width: normalizeOptionalPositiveNumber(image?.width),
  };
}

function normalizeInlineRuns(content = []) {
  const runs = [];

  content.forEach((node) => {
    if (!node) {
      return;
    }

    if (node.type === "text") {
      const text = String(node.text ?? "");

      if (!text) {
        return;
      }

      runs.push({
        bold: hasMark(node, "bold"),
        italic: hasMark(node, "italic"),
        strike: hasMark(node, "strike"),
        subscript: hasMark(node, "subscript"),
        superscript: hasMark(node, "superscript"),
        text,
        underline: hasMark(node, "underline"),
      });
      return;
    }

    if (node.type === "hardBreak") {
      runs.push({ text: "\n" });
      return;
    }

    if (node.type === MATH_INLINE_NODE_NAME) {
      runs.push({
        math: true,
        text: getMathPlainText(node.attrs),
      });
      return;
    }

    if (node.type === "image") {
      const alt = normalizeText(node.attrs?.alt, "Image");
      runs.push({ italic: true, text: `[${alt}]` });
      return;
    }

    if (Array.isArray(node.content)) {
      runs.push(...normalizeInlineRuns(node.content));
    }
  });

  return runs;
}

export function getRichTextNodeText(node) {
  if (!node) {
    return "";
  }

  if (node.type === "text") {
    return String(node.text ?? "");
  }

  if (node.type === "hardBreak") {
    return "\n";
  }

  if (node.type === "image") {
    return normalizeText(node.attrs?.alt, "Image");
  }

  if (node.type === MATH_INLINE_NODE_NAME || node.type === MATH_BLOCK_NODE_NAME) {
    return getMathPlainText(node.attrs);
  }

  if (node.type === "questionBlock") {
    return "";
  }

  if (!Array.isArray(node.content)) {
    return "";
  }

  return node.content
    .map((childNode) => getRichTextNodeText(childNode))
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasRunsContent(runs = []) {
  return runs.some((run) => String(run.text ?? "").trim());
}

function normalizeTableRows(tableNode) {
  const rows = Array.isArray(tableNode?.content) ? tableNode.content : [];
  const normalizedRows = rows
    .filter((rowNode) => rowNode?.type === TABLE_ROW_TYPE)
    .map((rowNode, rowIndex) => {
      const cells = Array.isArray(rowNode.content) ? rowNode.content : [];

      return {
        cells: cells
          .filter((cellNode) => TABLE_CELL_TYPES.has(cellNode?.type))
          .map((cellNode, cellIndex) => {
            const blocks = normalizeRichTextBlocks({
              content: cellNode.content ?? [],
              type: "doc",
            });

            return {
              blocks,
              id: createId(`row-${rowIndex + 1}-cell`, cellIndex),
              isHeader: cellNode.type === "tableHeader",
              plainText: getRichTextNodeText(cellNode),
            };
          }),
        id: createId("row", rowIndex),
      };
    })
    .filter((row) => row.cells.length > 0);
  const columnCount = normalizedRows.reduce(
    (highestColumnCount, row) => Math.max(highestColumnCount, row.cells.length),
    0,
  );

  return {
    columnCount,
    rows: normalizedRows,
  };
}

function normalizeListItems(listNode) {
  const listItems = Array.isArray(listNode?.content) ? listNode.content : [];

  return listItems
    .filter((itemNode) => itemNode?.type === "listItem")
    .map((itemNode, index) => ({
      blocks: normalizeRichTextBlocks({
        content: itemNode.content ?? [],
        type: "doc",
      }),
      id: createId("item", index),
    }))
    .filter((item) => item.blocks.length > 0);
}

function hasBlockContent(block) {
  if (!block) {
    return false;
  }

  if (Array.isArray(block.runs)) {
    return hasRunsContent(block.runs);
  }

  if (Array.isArray(block.items)) {
    return block.items.length > 0;
  }

  if (Array.isArray(block.rows)) {
    return block.rows.length > 0;
  }

  if (block.type === "divider") {
    return true;
  }

  if (block.type === "math") {
    return Boolean(String(block.latex ?? "").trim());
  }

  return Boolean(block.src);
}

export function createPlainTextBlocks(text) {
  const normalizedText = normalizeText(text);

  return normalizedText
    ? [
        {
          align: "",
          runs: [{ text: normalizedText }],
          type: "paragraph",
        },
      ]
    : [];
}

export function normalizeRichTextBlocks(content) {
  const root = cloneJson(content, null);
  const nodes = Array.isArray(root?.content)
    ? root.content
    : root
      ? [root]
      : [];
  const blocks = [];

  nodes.forEach((node) => {
    if (!node || node.type === "questionBlock") {
      return;
    }

    if (RICH_TEXT_CONTAINER_TYPES.has(node.type)) {
      blocks.push(
        ...normalizeRichTextBlocks({
          content: node.content ?? [],
          type: "doc",
        }),
      );
      return;
    }

    if (node.type === "paragraph") {
      blocks.push({
        align: getTextAlign(node.attrs),
        runs: normalizeInlineRuns(node.content ?? []),
        type: "paragraph",
      });
      return;
    }

    if (node.type === "heading") {
      blocks.push({
        align: getTextAlign(node.attrs),
        level: normalizePositiveNumber(node.attrs?.level, 2),
        runs: normalizeInlineRuns(node.content ?? []),
        type: "heading",
      });
      return;
    }

    if (node.type === "bulletList" || node.type === "orderedList") {
      blocks.push({
        items: normalizeListItems(node),
        ordered: node.type === "orderedList",
        start: normalizePositiveNumber(node.attrs?.start, 1),
        type: "list",
      });
      return;
    }

    if (node.type === "table") {
      blocks.push({
        ...normalizeTableRows(node),
        type: "table",
      });
      return;
    }

    if (node.type === "horizontalRule") {
      blocks.push({
        type: "divider",
      });
      return;
    }

    if (node.type === MATH_BLOCK_NODE_NAME) {
      blocks.push({
        latex: getMathPlainText(node.attrs),
        type: "math",
      });
      return;
    }

    if (node.type === "image") {
      blocks.push({
        ...normalizeRichTextImage(node.attrs, "Image"),
        type: "image",
      });
      return;
    }

    if (Array.isArray(node.content)) {
      blocks.push(
        ...normalizeRichTextBlocks({
          content: node.content,
          type: "doc",
        }),
      );
    }
  });

  return blocks.filter(hasBlockContent);
}
