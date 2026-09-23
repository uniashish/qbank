import { QUESTION_TYPES } from "../../../question-designer/constants/questionTypes.js";

const GOOGLE_DOCS_IMAGE_URI_LIMIT = 2000;
const GOOGLE_DOCS_MAX_IMAGE_WIDTH = 560;
const GOOGLE_DOCS_IMAGE_ALIGNMENTS = new Set(["center", "left", "right"]);

function normalizeText(value, fallback = "") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("\n", " ");
}

function isPublicImageUri(uri) {
  if (!uri || uri.length > GOOGLE_DOCS_IMAGE_URI_LIMIT) {
    return false;
  }

  try {
    const url = new URL(uri);

    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function normalizeDimension(value) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

function getImageDimensionAttributes(block) {
  const width = normalizeDimension(block.width);

  if (!width) {
    return "";
  }

  const displayWidth = Math.min(width, GOOGLE_DOCS_MAX_IMAGE_WIDTH);
  const height = normalizeDimension(block.height);
  const displayHeight =
    height && width ? Math.round(displayWidth * (height / width)) : null;
  const style = `width: ${displayWidth}px; height: auto; max-width: ${GOOGLE_DOCS_MAX_IMAGE_WIDTH}px;`;

  return [
    `width="${escapeAttribute(displayWidth)}"`,
    displayHeight ? `height="${escapeAttribute(displayHeight)}"` : "",
    `style="${escapeAttribute(style)}"`,
  ]
    .filter(Boolean)
    .join(" ");
}

function renderRuns(runs = []) {
  return runs
    .map((run) => {
      let html = escapeHtml(run.text).replaceAll("\n", "<br>");

      if (!html) {
        return "";
      }

      if (run.superscript) {
        html = `<sup>${html}</sup>`;
      }

      if (run.subscript) {
        html = `<sub>${html}</sub>`;
      }

      if (run.strike) {
        html = `<s>${html}</s>`;
      }

      if (run.underline) {
        html = `<u>${html}</u>`;
      }

      if (run.italic) {
        html = `<em>${html}</em>`;
      }

      if (run.bold) {
        html = `<strong>${html}</strong>`;
      }

      return html;
    })
    .join("");
}

function getAlignmentStyle(block) {
  return block.align ? ` style="text-align: ${escapeAttribute(block.align)};"` : "";
}

function getImageAlignmentStyle(block) {
  const align = GOOGLE_DOCS_IMAGE_ALIGNMENTS.has(block.align)
    ? block.align
    : "center";

  return ` style="text-align: ${escapeAttribute(align)};"`;
}

function renderImageBlock(block) {
  if (!isPublicImageUri(block.src)) {
    return `<p class="image-fallback">[Image${block.alt ? `: ${escapeHtml(block.alt)}` : ""}]</p>`;
  }

  const dimensionAttributes = getImageDimensionAttributes(block);
  const imageAttributes = [
    `src="${escapeAttribute(block.src)}"`,
    `alt="${escapeAttribute(block.alt || "Image")}"`,
    dimensionAttributes,
  ]
    .filter(Boolean)
    .join(" ");

  return [
    `<p${getImageAlignmentStyle(block)}>`,
    `<img ${imageAttributes} />`,
    "</p>",
  ].join("");
}

function renderTableBlock(block) {
  const columnCount = Math.max(block.columnCount || 0, 1);

  return [
    "<table>",
    "<tbody>",
    block.rows
      .map((row) => {
        const cells = [...row.cells];

        while (cells.length < columnCount) {
          cells.push({
            blocks: [],
            id: `empty-${cells.length}`,
            isHeader: false,
          });
        }

        return [
          "<tr>",
          cells
            .map((cell) => {
              const tagName = cell.isHeader ? "th" : "td";
              const content = cell.blocks.length
                ? renderRichBlocks(cell.blocks)
                : "&nbsp;";

              return `<${tagName}>${content}</${tagName}>`;
            })
            .join(""),
          "</tr>",
        ].join("");
      })
      .join(""),
    "</tbody>",
    "</table>",
  ].join("");
}

export function renderRichBlocks(blocks = []) {
  return blocks
    .map((block) => {
      if (!block) {
        return "";
      }

      if (block.type === "heading") {
        const level = Math.min(Math.max(Number(block.level) || 2, 1), 3);

        return `<h${level}${getAlignmentStyle(block)}>${renderRuns(block.runs)}</h${level}>`;
      }

      if (block.type === "list") {
        const tagName = block.ordered ? "ol" : "ul";
        const startAttribute =
          block.ordered && block.start > 1
            ? ` start="${escapeAttribute(block.start)}"`
            : "";

        return [
          `<${tagName}${startAttribute}>`,
          block.items
            .map((item) => `<li>${renderRichBlocks(item.blocks)}</li>`)
            .join(""),
          `</${tagName}>`,
        ].join("");
      }

      if (block.type === "table") {
        return renderTableBlock(block);
      }

      if (block.type === "image") {
        return renderImageBlock(block);
      }

      if (block.type === "paragraph") {
        const content = renderRuns(block.runs);

        return `<p${getAlignmentStyle(block)}>${content || "<br>"}</p>`;
      }

      return "";
    })
    .join("");
}

function renderMetaRows(metaRows = []) {
  if (!metaRows.length) {
    return "";
  }

  return [
    "<table class=\"meta-table\"><tbody>",
    metaRows
      .map(
        (row) =>
          `<tr><th>${escapeHtml(row.label)}</th><td>${escapeHtml(row.value)}</td></tr>`,
      )
      .join(""),
    "</tbody></table>",
  ].join("");
}

function renderQuestionImage(question) {
  if (!question.image) {
    return "";
  }

  return renderImageBlock({
    align: question.image.align,
    alt: question.image.alt,
    height: question.image.height,
    src: question.image.src,
    type: "image",
    width: question.image.width,
  });
}

function renderMultipleChoiceOptions(question) {
  if (!Array.isArray(question.options) || !question.options.length) {
    return "<p>No options available.</p>";
  }

  return [
    "<ol class=\"choice-list\" type=\"A\">",
    question.options
      .map((option) => `<li>${escapeHtml(option.text)}</li>`)
      .join(""),
    "</ol>",
  ].join("");
}

function renderMatchFollowing(question) {
  const columnA = question.matchColumns?.columnA ?? [];
  const columnB = question.matchColumns?.columnB ?? [];
  const rowCount = Math.max(columnA.length, columnB.length);

  if (!rowCount) {
    return "<p>No matching pairs available.</p>";
  }

  const rows = [];

  for (let index = 0; index < rowCount; index += 1) {
    const leftItem = columnA[index];
    const rightItem = columnB[index];

    rows.push(
      [
        "<tr>",
        `<td>${leftItem ? `${escapeHtml(leftItem.label)}. ${escapeHtml(leftItem.text)}` : ""}</td>`,
        `<td>${rightItem ? `${escapeHtml(rightItem.label)}. ${escapeHtml(rightItem.text)}` : ""}</td>`,
        "</tr>",
      ].join(""),
    );
  }

  return [
    "<table class=\"match-table\"><thead><tr><th>Column A</th><th>Column B</th></tr></thead><tbody>",
    rows.join(""),
    "</tbody></table>",
  ].join("");
}

function renderQuestionSpecificContent(question) {
  if (question.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return renderMultipleChoiceOptions(question);
  }

  if (question.type === QUESTION_TYPES.MATCH_FOLLOWING) {
    return renderMatchFollowing(question);
  }

  if (
    question.type === QUESTION_TYPES.LONG_ANSWER &&
    question.suggestedWordCount
  ) {
    return `<p class="question-note">Suggested answer length: ${escapeHtml(question.suggestedWordCount)} words</p>`;
  }

  return "";
}

function renderQuestion(question) {
  return [
    "<section class=\"question\">",
    `<p class="question-heading"><strong>Q${escapeHtml(question.number)}.</strong> ${question.marksLabel ? `<span>${escapeHtml(`[${question.marksLabel}]`)}</span>` : ""}</p>`,
    question.typeLabel ? `<p class="question-type">${escapeHtml(question.typeLabel)}</p>` : "",
    renderRichBlocks(question.promptBlocks),
    question.instructions
      ? `<p class="question-note">${escapeHtml(question.instructions)}</p>`
      : "",
    renderQuestionImage(question),
    renderQuestionSpecificContent(question),
    "</section>",
  ].join("");
}

function renderAnswerKeyEntry(entry) {
  const answer = entry.answer ?? {};

  if (answer.kind === QUESTION_TYPES.MULTIPLE_CHOICE) {
    const answerText = answer.optionLabel
      ? `${answer.optionLabel}${answer.optionText ? `. ${answer.optionText}` : ""}`
      : "No correct option selected";

    return `<p>${escapeHtml(answerText)}</p>`;
  }

  if (answer.kind === QUESTION_TYPES.TRUE_FALSE) {
    return `<p>${escapeHtml(answer.value || "No correct answer selected")}</p>`;
  }

  if (answer.kind === QUESTION_TYPES.FILL_BLANKS) {
    if (!answer.blanks?.length) {
      return "<p>No blank answers defined.</p>";
    }

    return [
      "<ol>",
      answer.blanks
        .map((blank) => {
          const acceptedAnswers = blank.acceptedAnswers?.length
            ? blank.acceptedAnswers.join(" / ")
            : "No accepted answer";

          return `<li>${escapeHtml(acceptedAnswers)}</li>`;
        })
        .join(""),
      "</ol>",
    ].join("");
  }

  if (answer.kind === QUESTION_TYPES.MATCH_FOLLOWING) {
    if (!answer.mappings?.length) {
      return "<p>No matching pairs defined.</p>";
    }

    return [
      "<ul>",
      answer.mappings
        .map(
          (mapping) =>
            `<li>${escapeHtml(mapping.leftLabel)} - ${escapeHtml(mapping.rightLabel || "?")}</li>`,
        )
        .join(""),
      "</ul>",
    ].join("");
  }

  if (
    answer.kind === QUESTION_TYPES.SHORT_ANSWER ||
    answer.kind === QUESTION_TYPES.LONG_ANSWER
  ) {
    return answer.hasModelAnswer && answer.modelAnswerBlocks?.length
      ? renderRichBlocks(answer.modelAnswerBlocks)
      : "<p>No model answer provided.</p>";
  }

  return `<p>${escapeHtml(answer.message || "Answer key rendering is not available.")}</p>`;
}

function renderAnswerKey(answerKey) {
  const entries = Array.isArray(answerKey?.entries) ? answerKey.entries : [];

  return [
    "<h1>ANSWER KEY</h1>",
    entries.length
      ? entries
          .map(
            (entry) => [
              "<section class=\"answer-entry\">",
              `<h2>Question ${escapeHtml(entry.questionNumber)}</h2>`,
              renderAnswerKeyEntry(entry),
              "</section>",
            ].join(""),
          )
          .join("")
      : "<p>No questions in this paper.</p>",
  ].join("");
}

function renderPaper(model) {
  return [
    `<h1 class="paper-title">${escapeHtml(model.title)}</h1>`,
    renderMetaRows(model.metaRows),
    model.instructions.length
      ? `<h2>Instructions</h2>${renderRichBlocks(model.instructions)}`
      : "",
    "<h2>Questions</h2>",
    model.questions.map(renderQuestion).join(""),
  ].join("");
}

function getDocumentCss() {
  return `
    body { color: #111827; font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.45; }
    h1, h2, h3, p { margin: 0 0 8pt; }
    h1 { font-size: 18pt; }
    h2 { font-size: 14pt; margin-top: 14pt; }
    h3 { font-size: 12pt; margin-top: 10pt; }
    img { height: auto; max-width: 560px; }
    table { border-collapse: collapse; margin: 8pt 0 12pt; width: 100%; }
    th, td { border: 1px solid #9ca3af; padding: 5pt; vertical-align: top; }
    th { background: #f3f4f6; font-weight: 700; }
    ul, ol { margin: 0 0 8pt 20pt; padding-left: 16pt; }
    li { margin-bottom: 3pt; }
    .paper-title { text-align: center; }
    .meta-table th { width: 30%; }
    .question { margin: 12pt 0; }
    .question-heading { display: flex; justify-content: space-between; }
    .question-type, .question-note, .image-fallback { color: #4b5563; font-size: 10pt; }
    .choice-list { list-style-type: upper-alpha; }
    .match-table th, .match-table td { width: 50%; }
    .answer-entry { margin: 10pt 0; }
    .page-break { page-break-before: always; break-before: page; }
  `;
}

export function buildGoogleDocsHtmlDocument({
  answerKeyOnly = false,
  includeAnswerKey = false,
  model,
}) {
  const body = answerKeyOnly
    ? renderAnswerKey(model.answerKey)
    : [
        renderPaper(model),
        includeAnswerKey
          ? `<div class="page-break"></div>${renderAnswerKey(model.answerKey)}`
          : "",
      ].join("");

  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<meta charset=\"utf-8\">",
    `<title>${escapeHtml(model.title)}</title>`,
    `<style>${getDocumentCss()}</style>`,
    "</head>",
    "<body>",
    body,
    "</body>",
    "</html>",
  ].join("");
}

export function createGoogleDocUrl(documentId) {
  return `https://docs.google.com/document/d/${encodeURIComponent(documentId)}/edit`;
}

export function normalizeGoogleDocsTitle(value, fallback = "Question Paper") {
  return normalizeText(value, fallback).slice(0, 120).trim() || fallback;
}
