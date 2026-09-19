import { getTagKey, normalizeTagText } from "../components/tags/tagUtils.js";

function normalizeSearchValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function matchesSearch(question, searchTerm) {
  const normalizedSearchTerm = normalizeSearchValue(searchTerm);

  if (!normalizedSearchTerm) {
    return true;
  }

  return [question.prompt, question.topicName, ...(question.tags ?? [])].some(
    (value) => normalizeSearchValue(value).includes(normalizedSearchTerm),
  );
}

function matchesFilters(question, filters = {}) {
  const selectedTagKey = getTagKey(filters.tag);

  return (
    (!filters.classId || question.classId === filters.classId) &&
    (!filters.subjectId || question.subjectId === filters.subjectId) &&
    (!filters.questionType || question.questionType === filters.questionType) &&
    (!filters.difficulty || question.difficulty === filters.difficulty) &&
    (!filters.topicName || question.topicName === filters.topicName) &&
    (!selectedTagKey ||
      (question.tags ?? []).some((tag) => getTagKey(tag) === selectedTagKey))
  );
}

export function hasQuestionBankFilters(filters = {}, searchTerm = "") {
  return (
    Boolean(normalizeSearchValue(searchTerm)) ||
    Object.values(filters).some((value) => Boolean(normalizeTagText(value)))
  );
}

export function filterQuestionBankQuestions(
  questions = [],
  { filters = {}, searchTerm = "" } = {},
) {
  return questions.filter(
    (question) => matchesSearch(question, searchTerm) && matchesFilters(question, filters),
  );
}
