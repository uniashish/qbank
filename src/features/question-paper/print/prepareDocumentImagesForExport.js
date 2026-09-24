import { EMPTY_RICH_TEXT_DOCUMENT } from "../../../components/rich-editor/editorExtensions.js";

const DEFAULT_PLACEHOLDER_WIDTH = 640;
const DEFAULT_PLACEHOLDER_HEIGHT = 180;

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

function normalizePositiveDimension(value, fallback) {
  const numericValue = Number.parseFloat(String(value ?? ""));

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : fallback;
}

function isBlobUrl(value) {
  return String(value ?? "").startsWith("blob:");
}

function escapeSvgText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
}

async function resolveBlobImageSource(src) {
  const response = await fetch(src);

  if (!response.ok) {
    throw new Error(`Image could not be read (${response.status}).`);
  }

  return readBlobAsDataUrl(await response.blob());
}

function createUnavailableImageDataUrl({ alt, height, title, width }) {
  const normalizedWidth = normalizePositiveDimension(
    width,
    DEFAULT_PLACEHOLDER_WIDTH,
  );
  const normalizedHeight = normalizePositiveDimension(
    height,
    DEFAULT_PLACEHOLDER_HEIGHT,
  );
  const label = String(alt || title || "Image unavailable for export")
    .replace(/\s+/g, " ")
    .trim();
  const safeLabel = escapeSvgText(label || "Image unavailable for export");
  const secondaryTextY = Math.round(normalizedHeight / 2 + 24);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${normalizedWidth}" height="${normalizedHeight}" viewBox="0 0 ${normalizedWidth} ${normalizedHeight}">
      <rect x="1" y="1" width="${normalizedWidth - 2}" height="${normalizedHeight - 2}" rx="8" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="10 8"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="16" font-weight="700">Image unavailable for export</text>
      <text x="50%" y="${secondaryTextY}" dominant-baseline="middle" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif" font-size="12">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

async function prepareImageNode(node, unresolvedImages) {
  const attrs = { ...(node.attrs ?? {}) };

  if (!isBlobUrl(attrs.src)) {
    return {
      ...node,
      attrs,
    };
  }

  try {
    attrs.src = await resolveBlobImageSource(attrs.src);
  } catch (error) {
    unresolvedImages.push({
      alt: attrs.alt || attrs.title || "",
      error,
      src: attrs.src,
    });
    attrs.src = createUnavailableImageDataUrl(attrs);
    attrs.alt = attrs.alt || "Image unavailable for export";
    attrs.title = attrs.title || "Image unavailable for export";
  }

  return {
    ...node,
    attrs,
  };
}

async function prepareNodeImages(node, unresolvedImages) {
  if (!node || typeof node !== "object") {
    return node;
  }

  let nextNode =
    node.type === "image"
      ? await prepareImageNode(node, unresolvedImages)
      : {
          ...node,
          ...(node.attrs ? { attrs: { ...node.attrs } } : {}),
        };

  if (!Array.isArray(node.content)) {
    return nextNode;
  }

  nextNode = {
    ...nextNode,
    content: await Promise.all(
      node.content.map((childNode) =>
        prepareNodeImages(childNode, unresolvedImages),
      ),
    ),
  };

  return nextNode;
}

export async function prepareDocumentImagesForExport(documentContent) {
  const unresolvedImages = [];
  const clonedDocument = cloneJson(documentContent, EMPTY_RICH_TEXT_DOCUMENT);
  const preparedDocument = await prepareNodeImages(
    clonedDocument,
    unresolvedImages,
  );

  return {
    documentContent: preparedDocument,
    unresolvedImages,
  };
}

export async function prepareAnswerKeyImagesForExport(answerKey) {
  const unresolvedImages = [];
  const clonedAnswerKey = cloneJson(answerKey, { entries: [], totalQuestions: 0 });
  const entries = Array.isArray(clonedAnswerKey.entries)
    ? clonedAnswerKey.entries
    : [];

  const preparedEntries = await Promise.all(
    entries.map(async (entry) => {
      const modelAnswer = entry.answer?.modelAnswer;

      if (!modelAnswer) {
        return entry;
      }

      const preparedModelAnswer = await prepareNodeImages(
        modelAnswer,
        unresolvedImages,
      );

      return {
        ...entry,
        answer: {
          ...entry.answer,
          modelAnswer: preparedModelAnswer,
        },
      };
    }),
  );

  return {
    answerKey: {
      ...clonedAnswerKey,
      entries: preparedEntries,
    },
    unresolvedImages,
  };
}
