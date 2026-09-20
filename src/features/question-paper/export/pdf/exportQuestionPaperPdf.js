import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";

import { ANSWER_KEY_MODES } from "../../answer-key/answerKeyGenerator.js";
import {
  buildPaperExportModel,
  sanitizeExportFilename,
} from "./buildPaperExportModel.js";
import PaperPdfDocument from "./PaperPdfDocument.jsx";

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

function normalizePageSize(pageSize) {
  return pageSize === "A4" ? "A4" : "A4";
}

function createDocumentElement(props) {
  return createElement(PaperPdfDocument, props);
}

async function renderPdfBlob(documentProps) {
  try {
    return await pdf(createDocumentElement(documentProps)).toBlob();
  } catch (error) {
    if (documentProps.includeImages === false) {
      throw error;
    }

    console.warn(
      "[Question paper export] Retrying PDF export without images.",
      { error },
    );

    return pdf(
      createDocumentElement({
        ...documentProps,
        includeImages: false,
      }),
    ).toBlob();
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  document.body.append(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 0);
}

function createPdfFilename(baseName, suffix = "") {
  const sanitizedBase = sanitizeExportFilename(baseName);
  const sanitizedSuffix = suffix ? ` ${suffix}` : "";

  return `${sanitizedBase}${sanitizedSuffix}.pdf`;
}

export async function exportQuestionPaperPdf({
  answerKeyOptions,
  pageSize = "A4",
  paper,
} = {}) {
  assertFinalizedPaper(paper);

  const model = buildPaperExportModel({
    answerKeyOptions,
    pageSize: normalizePageSize(pageSize),
    paper,
  });
  const mode = model.answerKeyOptions.mode;
  const paperFilename = createPdfFilename(model.filenameBase);
  const exportedFiles = [];

  const paperBlob = await renderPdfBlob({
    includeAnswerKey: mode === ANSWER_KEY_MODES.APPEND,
    includeImages: true,
    includePaper: true,
    model,
  });

  downloadBlob(paperBlob, paperFilename);
  exportedFiles.push(paperFilename);

  if (mode === ANSWER_KEY_MODES.SEPARATE) {
    const answerKeyFilename = createPdfFilename(
      model.filenameBase,
      "- Answer Key",
    );
    const answerKeyBlob = await renderPdfBlob({
      includeAnswerKey: true,
      includeImages: true,
      includePaper: false,
      model,
    });

    downloadBlob(answerKeyBlob, answerKeyFilename);
    exportedFiles.push(answerKeyFilename);
  }

  return {
    answerKeyMode: mode,
    files: exportedFiles,
    model,
  };
}
