import { normalizeTemplateSections } from "../sections/templateSectionUtils.js";

export const EMPTY_TEMPLATE_DOCUMENT_CONTENT = {
  content: [],
  type: "doc",
};

export const DEFAULT_TEMPLATE_SETTINGS = {
  showClass: true,
  showDuration: true,
  showExamName: true,
  showMaximumMarks: true,
  showSchoolName: true,
  showSubject: true,
};

const TEMPLATE_STATUSES = new Set(["active", "archived"]);

function cloneJson(value, fallback) {
  if (value == null) {
    return fallback;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeOptionalPositiveInteger(value) {
  if (value == null || value === "") {
    return null;
  }

  const numericValue = Number(value);

  return Number.isSafeInteger(numericValue) && numericValue > 0
    ? numericValue
    : null;
}

function normalizeDocumentContent(documentContent) {
  const clonedDocument = cloneJson(
    documentContent,
    EMPTY_TEMPLATE_DOCUMENT_CONTENT,
  );

  if (clonedDocument?.type !== "doc" || !Array.isArray(clonedDocument.content)) {
    return EMPTY_TEMPLATE_DOCUMENT_CONTENT;
  }

  return clonedDocument;
}

function normalizeSections(sections) {
  return normalizeTemplateSections(cloneJson(sections, []));
}

function normalizeSettings(settings = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_TEMPLATE_SETTINGS).map(([key, defaultValue]) => [
      key,
      typeof settings[key] === "boolean" ? settings[key] : defaultValue,
    ]),
  );
}

export function createQuestionPaperTemplateOwner(userProfile) {
  return {
    email: normalizeText(userProfile?.email),
    name: normalizeText(userProfile?.name),
    uid: normalizeText(userProfile?.uid),
  };
}

export function createQuestionPaperTemplateDefaultSetup(template = {}) {
  const defaultSetup = template.defaultSetup ?? {};

  return {
    academicYear: normalizeText(defaultSetup.academicYear),
    durationMinutes: normalizeOptionalPositiveInteger(
      defaultSetup.durationMinutes ?? template.durationMinutes,
    ),
    examName: normalizeText(defaultSetup.examName),
    maximumMarks: normalizeOptionalPositiveInteger(
      defaultSetup.maximumMarks ?? template.maximumMarks,
    ),
    term: normalizeText(defaultSetup.term),
  };
}

export function createQuestionPaperTemplateFields(template = {}) {
  const status = TEMPLATE_STATUSES.has(template.status)
    ? template.status
    : "active";

  return {
    defaultSetup: createQuestionPaperTemplateDefaultSetup(template),
    description: normalizeText(template.description),
    documentContent: normalizeDocumentContent(template.documentContent),
    name: normalizeText(template.name),
    sections: normalizeSections(template.sections),
    settings: normalizeSettings(template.settings),
    status,
  };
}

export function createQuestionPaperTemplateDocument({
  template,
  userProfile,
}) {
  return {
    ...createQuestionPaperTemplateFields({
      ...template,
      status: "active",
    }),
    createdBy: createQuestionPaperTemplateOwner(userProfile),
  };
}

export function normalizeQuestionPaperTemplate(template) {
  const normalizedTemplate = createQuestionPaperTemplateFields(template);

  return {
    ...template,
    ...normalizedTemplate,
    durationMinutes: normalizedTemplate.defaultSetup.durationMinutes,
    maximumMarks: normalizedTemplate.defaultSetup.maximumMarks,
  };
}
