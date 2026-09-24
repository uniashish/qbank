import { createElement } from "react";
import { flushSync } from "react-dom";
import { createRoot } from "react-dom/client";

import {
  ANSWER_KEY_MODES,
  generateAnswerKeyModel,
  normalizeAnswerKeyOptions,
} from "../../answer-key/answerKeyGenerator.js";
import {
  prepareAnswerKeyImagesForExport,
  prepareDocumentImagesForExport,
} from "../../print/prepareDocumentImagesForExport.js";
import QuestionPaperPrintView from "../../print/QuestionPaperPrintView.jsx";
import { sanitizeExportFilename } from "./buildPaperExportModel.js";

const PDF_PAGE_MARGIN_MM = 14;
const PDF_RENDER_TIMEOUT_MS = 5000;
const PDF_SAFE_CAPTURE_CSS = `
  .question-paper-print-document,
  .question-paper-print-document * {
    background-color: transparent !important;
    background-image: none !important;
    border-color: #cbd5e1 !important;
    box-shadow: none !important;
    color: #0f172a !important;
    outline-color: #1d4ed8 !important;
    text-decoration-color: currentColor !important;
    text-shadow: none !important;
  }

  .question-paper-print-document,
  .question-paper-print-paper .rich-text-editor__document,
  .question-paper-print-paper .rich-text-editor__prose,
  .question-paper-print-answer-key {
    background-color: #ffffff !important;
  }

  .question-paper-print-paper .rich-text-editor__prose table.rich-text-editor__table th {
    background-color: #f8fafc !important;
  }

  .question-block-node,
  .question-block-static,
  .question-block-node__meta span {
    background-color: #ffffff !important;
  }

  .question-block-node__marks {
    background-color: #dbeafe !important;
    color: #1d4ed8 !important;
  }

  .question-block-node__match-heading,
  .question-block-node__match-item > span,
  .question-block-node__meta span,
  .question-paper-print-answer-key__header p:not(.question-papers-header__eyebrow) {
    color: #64748b !important;
  }

  .rich-text-editor__prose .rich-text-editor-math-node__fallback {
    background-color: #fef2f2 !important;
    border-color: #fecaca !important;
    color: #991b1b !important;
  }
`;

function createExportError(message) {
  return new Error(message);
}

function assertFinalizedPaper(paper) {
  if (!paper) {
    throw createExportError("Choose a finalized paper to export.");
  }

  if (paper.status !== "final") {
    throw createExportError("Only finalized papers can be exported.");
  }
}

function assertBrowserPdfSupport() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    throw createExportError("PDF export is not available in this environment.");
  }
}

function normalizePageSize(pageSize) {
  return pageSize === "A4" ? "A4" : "A4";
}

function createPdfFilename(baseName, suffix = "") {
  const sanitizedBase = sanitizeExportFilename(baseName);
  const sanitizedSuffix = suffix ? ` ${suffix}` : "";

  return `${sanitizedBase}${sanitizedSuffix}.pdf`;
}

function delay(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function nextAnimationFrame() {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => resolve());
  });
}

async function waitForExportRender(host) {
  const start = window.performance.now();

  while (window.performance.now() - start < PDF_RENDER_TIMEOUT_MS) {
    if (
      host.querySelector(".question-paper-print-document") &&
      (!host.querySelector(".question-paper-print-paper") ||
        host.querySelector(".rich-text-editor__prose"))
    ) {
      await nextAnimationFrame();
      await nextAnimationFrame();
      return;
    }

    await delay(50);
  }
}

async function waitForImages(host) {
  const images = Array.from(host.querySelectorAll("img"));

  await Promise.all(
    images.map(
      (image) =>
        new Promise((resolve) => {
          if (image.complete) {
            if (typeof image.decode === "function") {
              image.decode().then(resolve).catch(resolve);
              return;
            }

            resolve();
            return;
          }

          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
    ),
  );
}

async function waitForFonts() {
  if (!document.fonts?.ready) {
    return;
  }

  try {
    await document.fonts.ready;
  } catch {
    // Font loading failures should not block export; the DOM fallback remains visible.
  }
}

async function waitForPdfCaptureReady(host) {
  await waitForExportRender(host);
  await waitForImages(host);
  await waitForFonts();
  await nextAnimationFrame();
  await nextAnimationFrame();
}

async function loadHtml2Pdf() {
  const html2pdfModule = await import("html2pdf.js");
  const html2pdf = html2pdfModule.default ?? html2pdfModule;

  if (typeof html2pdf !== "function") {
    throw createExportError("PDF export library could not be loaded.");
  }

  return html2pdf;
}

function getCanvasScale() {
  const devicePixelRatio = Number(window.devicePixelRatio) || 1;

  return Math.min(2, Math.max(1, devicePixelRatio));
}

function createHtml2PdfOptions({ filename, pageSize, sourceElement }) {
  return {
    enableLinks: false,
    filename,
    html2canvas: {
      allowTaint: false,
      backgroundColor: "#ffffff",
      imageTimeout: 15000,
      logging: false,
      onclone: injectPdfSafeCaptureStyles,
      scale: getCanvasScale(),
      scrollX: 0,
      scrollY: 0,
      useCORS: true,
      windowHeight: Math.max(sourceElement.scrollHeight, window.innerHeight),
      windowWidth: Math.max(sourceElement.scrollWidth, window.innerWidth),
    },
    image: {
      quality: 0.98,
      type: "jpeg",
    },
    jsPDF: {
      format: pageSize.toLowerCase(),
      orientation: "portrait",
      unit: "mm",
    },
    margin: [
      PDF_PAGE_MARGIN_MM,
      PDF_PAGE_MARGIN_MM,
      PDF_PAGE_MARGIN_MM,
      PDF_PAGE_MARGIN_MM,
    ],
    pagebreak: {
      avoid: [".question-block-node--print", ".answer-key-question"],
      mode: ["css", "legacy"],
    },
  };
}

function injectPdfSafeCaptureStyles(clonedDocument) {
  const style = clonedDocument.createElement("style");

  style.setAttribute("data-question-paper-pdf-capture", "true");
  style.textContent = PDF_SAFE_CAPTURE_CSS;
  clonedDocument.head.append(style);
}

async function renderQuestionPaperExportHost({
  answerKey,
  documentContent,
  includeAnswerKey,
  includePaper,
}) {
  const host = document.createElement("div");
  const root = createRoot(host);

  host.className = "question-paper-print-host question-paper-print-host--pdf";
  host.setAttribute("aria-hidden", "true");
  document.body.append(host);

  flushSync(() => {
    root.render(
      createElement(QuestionPaperPrintView, {
        answerKey,
        documentContent,
        includeAnswerKey,
        includePaper,
      }),
    );
  });

  try {
    await waitForPdfCaptureReady(host);
  } catch (error) {
    cleanupQuestionPaperExportHost({ host, root });
    throw error;
  }

  return {
    host,
    root,
  };
}

function cleanupQuestionPaperExportHost({ host, root }) {
  flushSync(() => {
    root.unmount();
  });
  host.remove();
}

async function saveQuestionPaperPdf({
  answerKey,
  documentContent,
  filename,
  includeAnswerKey,
  includePaper,
  pageSize,
}) {
  const html2pdf = await loadHtml2Pdf();
  const renderResult = await renderQuestionPaperExportHost({
    answerKey,
    documentContent,
    includeAnswerKey,
    includePaper,
  });
  const sourceElement = renderResult.host.querySelector(
    ".question-paper-print-document",
  );

  try {
    if (!sourceElement) {
      throw createExportError("Question paper could not be rendered for PDF export.");
    }

    await html2pdf()
      .set(createHtml2PdfOptions({ filename, pageSize, sourceElement }))
      .from(sourceElement)
      .save();
  } finally {
    cleanupQuestionPaperExportHost(renderResult);
  }
}

function getFilenameBase(paper) {
  return sanitizeExportFilename(paper?.title, "Question Paper");
}

async function preparePaperPrintData(paper) {
  const preparedPaper = await prepareDocumentImagesForExport(
    paper.documentContent,
  );
  const answerKey = generateAnswerKeyModel({
    documentContent: preparedPaper.documentContent,
    questionBlocks: paper.questions,
  });
  const preparedAnswerKey = await prepareAnswerKeyImagesForExport(answerKey);

  return {
    answerKey: preparedAnswerKey.answerKey,
    documentContent: preparedPaper.documentContent,
    unresolvedImages: [
      ...preparedPaper.unresolvedImages,
      ...preparedAnswerKey.unresolvedImages,
    ],
  };
}

export async function exportQuestionPaperPdf({
  answerKeyOptions,
  pageSize = "A4",
  paper,
} = {}) {
  assertBrowserPdfSupport();
  assertFinalizedPaper(paper);

  const normalizedPageSize = normalizePageSize(pageSize);
  const mode = normalizeAnswerKeyOptions(answerKeyOptions).mode;
  const filenameBase = getFilenameBase(paper);
  const paperFilename = createPdfFilename(filenameBase);
  const exportedFiles = [];
  const { answerKey, documentContent, unresolvedImages } =
    await preparePaperPrintData(paper);

  await saveQuestionPaperPdf({
    answerKey,
    documentContent,
    filename: paperFilename,
    includeAnswerKey: mode === ANSWER_KEY_MODES.APPEND,
    includePaper: true,
    pageSize: normalizedPageSize,
  });
  exportedFiles.push(paperFilename);

  if (mode === ANSWER_KEY_MODES.SEPARATE) {
    const answerKeyFilename = createPdfFilename(
      filenameBase,
      "- Answer Key",
    );

    await saveQuestionPaperPdf({
      answerKey,
      documentContent,
      filename: answerKeyFilename,
      includeAnswerKey: true,
      includePaper: false,
      pageSize: normalizedPageSize,
    });
    exportedFiles.push(answerKeyFilename);
  }

  if (unresolvedImages.length > 0) {
    console.warn(
      "[Question paper export] Some images could not be resolved for print export.",
      { unresolvedImages },
    );
  }

  return {
    answerKeyMode: mode,
    files: exportedFiles,
    imageWarnings: unresolvedImages,
    pageSize: normalizedPageSize,
  };
}
