export const INITIAL_PAPER_SETUP_VALUES = {
  title: "",
  classId: "",
  subjectId: "",
  examName: "",
  term: "",
  academicYear: "",
  durationMinutes: null,
  maximumMarks: null,
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

function hasClassAssignment(classOptions, classId) {
  return classOptions.some((classOption) => classOption.id === classId);
}

function hasSubjectAssignment(getSubjectIdsForClass, classId, subjectId) {
  if (!classId || !subjectId) {
    return false;
  }

  return getSubjectIdsForClass(classId).includes(subjectId);
}

export function validateQuestionPaperSetup(
  values,
  { classOptions = [], getSubjectIdsForClass = () => [] } = {},
) {
  const errors = {};
  const normalizedValues = {
    title: trimValue(values.title),
    classId: values.classId || "",
    subjectId: values.subjectId || "",
    examName: trimValue(values.examName),
    term: trimValue(values.term),
    academicYear: trimValue(values.academicYear),
    durationMinutes: null,
    maximumMarks: null,
  };

  if (!normalizedValues.title) {
    errors.title = "Enter a paper title.";
  }

  if (!normalizedValues.classId) {
    errors.classId = "Choose a class.";
  } else if (!hasClassAssignment(classOptions, normalizedValues.classId)) {
    errors.classId = "Choose one of your assigned classes.";
  }

  if (!normalizedValues.subjectId) {
    errors.subjectId = "Choose a subject.";
  } else if (
    normalizedValues.classId &&
    !hasSubjectAssignment(
      getSubjectIdsForClass,
      normalizedValues.classId,
      normalizedValues.subjectId,
    )
  ) {
    errors.subjectId = "Choose a subject assigned to the selected class.";
  }

  const durationResult = parsePositiveWholeNumber(
    values.durationMinutes,
    "Enter a positive whole number of minutes.",
  );
  const marksResult = parsePositiveWholeNumber(
    values.maximumMarks,
    "Enter a positive whole number of marks.",
  );

  if (durationResult.error) {
    errors.durationMinutes = durationResult.error;
  } else {
    normalizedValues.durationMinutes = durationResult.value;
  }

  if (marksResult.error) {
    errors.maximumMarks = marksResult.error;
  } else {
    normalizedValues.maximumMarks = marksResult.value;
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    values: normalizedValues,
  };
}
