const EMPTY_SECTION_FORM_VALUES = {
  instructions: "",
  subtitle: "",
  targetMarks: "",
  title: "",
};

let fallbackIdCounter = 0;

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeTargetMarks(value) {
  const targetMarksText = normalizeText(value);

  if (!targetMarksText) {
    return null;
  }

  if (!/^\d+$/.test(targetMarksText)) {
    return null;
  }

  const targetMarks = Number(targetMarksText);

  return Number.isSafeInteger(targetMarks) && targetMarks > 0
    ? targetMarks
    : null;
}

export function createTemplateSectionId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackIdCounter += 1;

  return [
    "section",
    Date.now().toString(36),
    fallbackIdCounter.toString(36),
    Math.random().toString(36).slice(2, 8),
  ].join("-");
}

export function createEmptyTemplateSection() {
  return {
    id: createTemplateSectionId(),
    instructions: "",
    subtitle: "",
    targetMarks: null,
    title: "",
  };
}

export function normalizeTemplateSection(section = {}) {
  return {
    id: normalizeText(section.id) || createTemplateSectionId(),
    instructions: normalizeText(section.instructions),
    subtitle: normalizeText(section.subtitle),
    targetMarks: normalizeTargetMarks(section.targetMarks),
    title: normalizeText(section.title),
  };
}

export function normalizeTemplateSections(sections) {
  if (!Array.isArray(sections)) {
    return [];
  }

  const usedIds = new Set();

  return sections.map((section) => {
    const normalizedSection = normalizeTemplateSection(section);

    while (usedIds.has(normalizedSection.id)) {
      normalizedSection.id = createTemplateSectionId();
    }

    usedIds.add(normalizedSection.id);

    return normalizedSection;
  });
}

export function createTemplateSectionFormValues(section = {}) {
  return {
    ...EMPTY_SECTION_FORM_VALUES,
    instructions: String(section.instructions ?? ""),
    subtitle: String(section.subtitle ?? ""),
    targetMarks:
      section.targetMarks == null ? "" : String(section.targetMarks),
    title: String(section.title ?? ""),
  };
}

export function updateTemplateSectionFormValue(values, fieldName, value) {
  return {
    ...values,
    [fieldName]: value,
  };
}

export function validateTemplateSectionValues(values = {}, sectionId) {
  const title = normalizeText(values.title);
  const subtitle = normalizeText(values.subtitle);
  const instructions = normalizeText(values.instructions);
  const targetMarksText = normalizeText(values.targetMarks);
  const errors = {};
  let targetMarks = null;

  if (!title) {
    errors.title = "Enter a section title.";
  }

  if (targetMarksText) {
    if (!/^\d+$/.test(targetMarksText)) {
      errors.targetMarks = "Enter a positive whole number.";
    } else {
      targetMarks = Number(targetMarksText);

      if (!Number.isSafeInteger(targetMarks) || targetMarks <= 0) {
        errors.targetMarks = "Enter a positive whole number.";
      }
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    section: {
      id: normalizeText(sectionId) || createTemplateSectionId(),
      instructions,
      subtitle,
      targetMarks,
      title,
    },
  };
}

export function addTemplateSection(sections, section) {
  return normalizeTemplateSections([
    ...normalizeTemplateSections(sections),
    section,
  ]);
}

export function updateTemplateSection(sections, sectionId, sectionInput) {
  return normalizeTemplateSections(sections).map((section) => {
    if (section.id !== sectionId) {
      return section;
    }

    return normalizeTemplateSection({
      ...sectionInput,
      id: section.id,
    });
  });
}

export function removeTemplateSection(sections, sectionId) {
  return normalizeTemplateSections(sections).filter(
    (section) => section.id !== sectionId,
  );
}

export function moveTemplateSection(sections, sectionId, direction) {
  const normalizedSections = normalizeTemplateSections(sections);
  const currentIndex = normalizedSections.findIndex(
    (section) => section.id === sectionId,
  );
  const nextIndex = currentIndex + direction;

  if (
    currentIndex < 0 ||
    nextIndex < 0 ||
    nextIndex >= normalizedSections.length
  ) {
    return normalizedSections;
  }

  const nextSections = [...normalizedSections];
  [nextSections[currentIndex], nextSections[nextIndex]] = [
    nextSections[nextIndex],
    nextSections[currentIndex],
  ];

  return nextSections;
}

export function hasMeaningfulTemplateSectionData(section = {}) {
  return Boolean(
    normalizeText(section.title) ||
      normalizeText(section.subtitle) ||
      normalizeText(section.instructions) ||
      section.targetMarks != null,
  );
}

export function calculateTemplateSectionsTargetMarks(sections) {
  return normalizeTemplateSections(sections).reduce(
    (total, section) => total + (section.targetMarks ?? 0),
    0,
  );
}

export function formatTemplateSectionMarks(targetMarks) {
  if (!targetMarks) {
    return "No target";
  }

  return `${targetMarks} mark${targetMarks === 1 ? "" : "s"}`;
}
