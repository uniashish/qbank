import { ANSWER_KEY_MODES } from "../../answer-key/answerKeyGenerator.js";
import { buildPaperExportModel } from "../pdf/buildPaperExportModel.js";
import {
  buildGoogleDocsHtmlDocument,
  normalizeGoogleDocsTitle,
} from "./googleDocsExportUtils.js";

function createDocumentPayload({ answerKeyOnly = false, includeAnswerKey = false, model, title }) {
  return {
    html: buildGoogleDocsHtmlDocument({
      answerKeyOnly,
      includeAnswerKey,
      model,
    }),
    title: normalizeGoogleDocsTitle(title),
  };
}

export function buildGoogleDocsExportModel({
  answerKeyOptions,
  paper,
} = {}) {
  const model = buildPaperExportModel({
    answerKeyOptions,
    pageSize: "A4",
    paper,
  });
  const mode = model.answerKeyOptions.mode;
  const documents = [
    createDocumentPayload({
      includeAnswerKey: mode === ANSWER_KEY_MODES.APPEND,
      model,
      title: model.title,
    }),
  ];

  if (mode === ANSWER_KEY_MODES.SEPARATE) {
    documents.push(
      createDocumentPayload({
        answerKeyOnly: true,
        model,
        title: `${model.title} - Answer Key`,
      }),
    );
  }

  return {
    answerKeyMode: mode,
    documents,
    paperId: model.paperId,
    title: model.title,
  };
}
