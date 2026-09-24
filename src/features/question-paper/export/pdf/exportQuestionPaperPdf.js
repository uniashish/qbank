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

const PRINT_CLEANUP_DELAY_MS = 1000;
const PRINT_RENDER_TIMEOUT_MS = 3000;

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

function assertBrowserPrintSupport() {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof window.print !== "function"
  ) {
    throw createExportError("Browser print is not available in this environment.");
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

function createDocumentTitle(filename) {
  return filename.replace(/\.pdf$/i, "");
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

async function waitForPrintRender(host) {
  const start = window.performance.now();

  while (window.performance.now() - start < PRINT_RENDER_TIMEOUT_MS) {
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
            resolve();
            return;
          }

          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        }),
    ),
  );
}

function waitForAfterPrintOrDelay() {
  return new Promise((resolve) => {
    let timeoutId;

    function finish() {
      window.clearTimeout(timeoutId);
      window.removeEventListener("afterprint", finish);
      resolve();
    }

    window.addEventListener("afterprint", finish, { once: true });
    timeoutId = window.setTimeout(finish, PRINT_CLEANUP_DELAY_MS);
  });
}

async function printQuestionPaperDocument({
  answerKey,
  documentContent,
  documentTitle,
  includeAnswerKey,
  includePaper,
}) {
  const host = document.createElement("div");
  const root = createRoot(host);
  const previousTitle = document.title;

  host.className = "question-paper-print-host";
  host.setAttribute("aria-hidden", "true");
  document.body.append(host);
  document.body.classList.add("question-paper-printing");
  document.title = documentTitle;

  try {
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

    await waitForPrintRender(host);
    await waitForImages(host);

    window.focus();
    const printFinished = waitForAfterPrintOrDelay();
    window.print();
    await printFinished;
  } finally {
    flushSync(() => {
      root.unmount();
    });
    host.remove();
    document.title = previousTitle;
    document.body.classList.remove("question-paper-printing");
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
  assertBrowserPrintSupport();
  assertFinalizedPaper(paper);

  const normalizedPageSize = normalizePageSize(pageSize);
  const mode = normalizeAnswerKeyOptions(answerKeyOptions).mode;
  const filenameBase = getFilenameBase(paper);
  const paperFilename = createPdfFilename(filenameBase);
  const exportedFiles = [];
  const { answerKey, documentContent, unresolvedImages } =
    await preparePaperPrintData(paper);

  await printQuestionPaperDocument({
    answerKey,
    documentContent,
    documentTitle: createDocumentTitle(paperFilename),
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

    await printQuestionPaperDocument({
      answerKey,
      documentContent,
      documentTitle: createDocumentTitle(answerKeyFilename),
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
