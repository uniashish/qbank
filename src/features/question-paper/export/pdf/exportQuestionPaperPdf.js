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

const PDF_PAGE_MARGIN_VERTICAL_MM = 18;
const PDF_PAGE_MARGIN_HORIZONTAL_MM = 16;
const PDF_RENDER_TIMEOUT_MS = 5000;
const PDF_SAFE_CAPTURE_CSS = `
  .question-paper-print-document,
  .question-paper-print-document * {
    background-image: none !important;
    box-shadow: none !important;
    text-shadow: none !important;
  }

  .question-paper-print-document {
    background-color: #ffffff !important;
    color: #000000 !important;
    font-family: Arial, Helvetica, sans-serif !important;
    font-size: 11pt !important;
    line-height: 1.4 !important;
  }

  .question-paper-print-paper .rich-text-editor,
  .question-paper-print-paper .rich-text-editor__document,
  .question-paper-print-paper .rich-text-editor__prose,
  .question-paper-print-answer-key {
    width: 100% !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    border-inline: 0 !important;
    border-radius: 0 !important;
    background-color: #ffffff !important;
    box-shadow: none !important;
    color: #000000 !important;
  }

  .paper-question {
    --paper-question-number-indent: 32px !important;
    margin: 0 0 16px !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .paper-question-header {
    display: flex !important;
    align-items: flex-start !important;
    justify-content: space-between !important;
    width: 100% !important;
    gap: 12px !important;
  }

  .paper-question-main {
    display: flex !important;
    align-items: flex-start !important;
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  .paper-question-number {
    display: inline-block !important;
    flex: 0 0 auto !important;
    margin-right: 6px !important;
    font-weight: 700 !important;
    white-space: nowrap !important;
  }

  .paper-question-content {
    flex: 1 1 auto !important;
    min-width: 0 !important;
  }

  .paper-question-content > :first-child,
  .paper-question-content .rich-document-renderer > :first-child {
    margin-top: 0 !important;
  }

  .paper-question-content p {
    margin: 0 0 6px 0 !important;
  }

  .paper-question-content p:last-child {
    margin-bottom: 0 !important;
  }

  .paper-question-marks {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    margin-left: 12px !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: none !important;
    color: #000000 !important;
    font-weight: 600 !important;
    text-align: right !important;
  }

  .paper-question-extra {
    margin-left: var(--paper-question-number-indent) !important;
    margin-top: 6px !important;
  }

  .paper-question-extra > :first-child {
    margin-top: 0 !important;
  }

  .paper-question-extra > * + * {
    margin-top: 8px !important;
  }

  .paper-question-instructions,
  .paper-question-options,
  .paper-true-false-options,
  .paper-match-table {
    margin: 0 !important;
  }

  .paper-question-options {
    padding-left: 22px !important;
  }

  .paper-option {
    margin: 4px 0 !important;
    padding-left: 4px !important;
  }

  .paper-match-table,
  .paper-match-table th,
  .paper-match-table td,
  .question-paper-print-paper .rich-text-editor__prose table.rich-text-editor__table,
  .question-paper-print-paper .rich-text-editor__prose table.rich-text-editor__table th,
  .question-paper-print-paper .rich-text-editor__prose table.rich-text-editor__table td {
    border-color: #000000 !important;
    background-color: #ffffff !important;
    color: #000000 !important;
  }

  .paper-answer-key-question {
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .rich-text-editor__prose hr {
    border: 0 !important;
    border-top: 1px solid #000000 !important;
  }

  .question-paper-print-paper .ProseMirror-selectednode,
  .question-paper-print-paper .question-block-node--selected,
  .question-paper-print-paper .rich-text-editor-image-node--selected .rich-text-editor-image-node__image {
    outline: 0 !important;
    box-shadow: none !important;
  }

  .rich-text-editor__prose .rich-text-editor-math-node__fallback {
    background-color: #ffffff !important;
    border-color: #000000 !important;
    color: #000000 !important;
  }

  .question-block-node,
  .question-block-static {
    margin: 0 0 16px !important;
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background-color: transparent !important;
    box-shadow: none !important;
  }

  .question-block-node__marks,
  .question-block-static__marks {
    padding: 0 !important;
    border: 0 !important;
    border-radius: 0 !important;
    background: none !important;
    color: #000000 !important;
    font-weight: 600 !important;
  }

  .question-paper-print-document,
  .question-paper-print-document * {
    color: #000000 !important;
    text-decoration-color: currentColor !important;
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
      PDF_PAGE_MARGIN_VERTICAL_MM,
      PDF_PAGE_MARGIN_HORIZONTAL_MM,
      PDF_PAGE_MARGIN_VERTICAL_MM,
      PDF_PAGE_MARGIN_HORIZONTAL_MM,
    ],
    pagebreak: {
      avoid: [".paper-question", ".paper-answer-key-question"],
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
