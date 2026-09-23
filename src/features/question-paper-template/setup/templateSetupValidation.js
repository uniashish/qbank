export const INITIAL_TEMPLATE_SETUP_VALUES = {
  name: "",
  description: "",
  defaultSetup: {
    examName: "",
    term: "",
    academicYear: "",
    durationMinutes: null,
    maximumMarks: null,
  },
};

function trimValue(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveWholeNumber(value, errorMessage) {
  const rawValue = value == null ? "" : String(value).trim();

  if (!rawValue) {
    return {
      error: "",
      value: null,
    };
  }

  if (!/^\d+$/.test(rawValue)) {
    return {
      error: errorMessage,
      value: null,
    };
  }

  const parsedValue = Number(rawValue);

  if (!Number.isSafeInteger(parsedValue) || parsedValue <= 0) {
    return {
      error: errorMessage,
      value: null,
    };
  }

  return {
    error: "",
    value: parsedValue,
  };
}

export function createInitialTemplateSetupValues(templateSetup = {}) {
  const defaultSetup = templateSetup.defaultSetup ?? {};

  return {
    name: templateSetup.name ?? INITIAL_TEMPLATE_SETUP_VALUES.name,
    description:
      templateSetup.description ?? INITIAL_TEMPLATE_SETUP_VALUES.description,
    defaultSetup: {
      examName:
        defaultSetup.examName ??
        INITIAL_TEMPLATE_SETUP_VALUES.defaultSetup.examName,
      term: defaultSetup.term ?? INITIAL_TEMPLATE_SETUP_VALUES.defaultSetup.term,
      academicYear:
        defaultSetup.academicYear ??
        INITIAL_TEMPLATE_SETUP_VALUES.defaultSetup.academicYear,
      durationMinutes:
        defaultSetup.durationMinutes ??
        INITIAL_TEMPLATE_SETUP_VALUES.defaultSetup.durationMinutes,
      maximumMarks:
        defaultSetup.maximumMarks ??
        INITIAL_TEMPLATE_SETUP_VALUES.defaultSetup.maximumMarks,
    },
  };
}

export function validateTemplateSetup(values) {
  const defaultSetup = values.defaultSetup ?? {};
  const errors = {};
  const normalizedValues = {
    name: trimValue(values.name),
    description: trimValue(values.description),
    defaultSetup: {
      examName: trimValue(defaultSetup.examName),
      term: trimValue(defaultSetup.term),
      academicYear: trimValue(defaultSetup.academicYear),
      durationMinutes: null,
      maximumMarks: null,
    },
  };

  if (!normalizedValues.name) {
    errors.name = "Enter a template name.";
  }

  const durationResult = parsePositiveWholeNumber(
    defaultSetup.durationMinutes,
    "Enter a positive whole number of minutes.",
  );
  const marksResult = parsePositiveWholeNumber(
    defaultSetup.maximumMarks,
    "Enter a positive whole number of marks.",
  );

  if (durationResult.error) {
    errors.durationMinutes = durationResult.error;
  } else {
    normalizedValues.defaultSetup.durationMinutes = durationResult.value;
  }

  if (marksResult.error) {
    errors.maximumMarks = marksResult.error;
  } else {
    normalizedValues.defaultSetup.maximumMarks = marksResult.value;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values: normalizedValues,
  };
}
