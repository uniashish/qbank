export const QUESTION_TYPES = {
  FILL_BLANKS: "fill_blanks",
  MULTIPLE_CHOICE: "multiple_choice",
  TRUE_FALSE: "true_false",
  MATCH_FOLLOWING: "match_following",
  SHORT_ANSWER: "short_answer",
  LONG_ANSWER: "long_answer",
};

export const QUESTION_TYPE_OPTIONS = [
  {
    description: "Learners complete missing words or phrases.",
    icon: "fileText",
    title: "Fill in the Blanks",
    type: QUESTION_TYPES.FILL_BLANKS,
  },
  {
    description: "Choose one correct answer from several options.",
    icon: "dashboard",
    title: "Multiple Choice",
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
  },
  {
    description: "Determine whether a statement is correct.",
    icon: "shield",
    title: "True / False",
    type: QUESTION_TYPES.TRUE_FALSE,
  },
  {
    description: "Match items between two related groups.",
    icon: "database",
    title: "Match the Following",
    type: QUESTION_TYPES.MATCH_FOLLOWING,
  },
  {
    description: "Answer with a brief written response.",
    icon: "book",
    title: "Short Answer Question",
    type: QUESTION_TYPES.SHORT_ANSWER,
  },
  {
    description: "Answer with an extended written response.",
    icon: "fileText",
    title: "Long Answer Question",
    type: QUESTION_TYPES.LONG_ANSWER,
  },
];

export function getQuestionTypeOption(type) {
  return (
    QUESTION_TYPE_OPTIONS.find((questionType) => questionType.type === type) ??
    null
  );
}

export function usesRichQuestionContent(type) {
  return (
    type === QUESTION_TYPES.LONG_ANSWER ||
    type === QUESTION_TYPES.SHORT_ANSWER
  );
}

export function usesSharedPromptField(type) {
  return !usesRichQuestionContent(type);
}
