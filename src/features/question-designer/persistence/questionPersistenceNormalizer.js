import { sanitizeTags } from "../../../components/tags/tagUtils.js";
import {
  QUESTION_TYPES,
  usesSharedPromptField,
} from "../constants/questionTypes.js";
import { createPersistableMatchPairs } from "../utils/matchPairHelpers.js";
import {
  cloneRichTextContent,
  getRichTextPlainText,
  normalizeRichTextContent,
} from "../utils/richTextContent.js";

function trimText(value) {
  return String(value ?? "").trim();
}

export function normalizeAnswerDataForSave(questionType, answerData = {}) {
  switch (questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return {
        blanks: (answerData.blanks ?? []).map((blank) => ({
          id: trimText(blank.id),
          acceptedAnswers: (blank.acceptedAnswers ?? []).map((answer) =>
            trimText(answer),
          ),
        })),
      };

    case QUESTION_TYPES.LONG_ANSWER:
      return {
        modelAnswer: cloneRichTextContent(answerData.modelAnswer),
        questionContent: cloneRichTextContent(answerData.questionContent),
        suggestedWordCount: answerData.suggestedWordCount ?? null,
      };

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return {
        correctOptionId: trimText(answerData.correctOptionId),
        options: (answerData.options ?? []).map((option) => ({
          content: normalizeRichTextContent(option.content, option.text ?? ""),
          id: trimText(option.id),
          text: trimText(option.text || getRichTextPlainText(option.content)),
        })),
      };

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return {
        pairs: createPersistableMatchPairs(answerData.pairs),
      };

    case QUESTION_TYPES.SHORT_ANSWER:
      return {
        modelAnswer: cloneRichTextContent(answerData.modelAnswer),
        questionContent: cloneRichTextContent(answerData.questionContent),
      };

    case QUESTION_TYPES.TRUE_FALSE:
      return {
        correctAnswer: answerData.correctAnswer,
      };

    default:
      return null;
  }
}

export function normalizeQuestionForSave(question) {
  const normalizedQuestion = {
    answerData: normalizeAnswerDataForSave(
      question.questionType,
      question.answerData,
    ),
    classId: question.classId,
    difficulty: question.difficulty,
    image: {
      downloadUrl: question.image?.downloadUrl ?? null,
      storagePath: question.image?.storagePath ?? null,
    },
    instructions: trimText(question.instructions),
    marks: Number(question.marks),
    prompt: trimText(question.prompt),
    questionType: question.questionType,
    status: question.status,
    subjectId: question.subjectId,
    tags: sanitizeTags(question.tags),
    topicName: trimText(question.topicName),
  };

  if (usesSharedPromptField(question.questionType)) {
    normalizedQuestion.promptContent = normalizeRichTextContent(
      question.promptContent,
      question.prompt,
    );
  }

  return normalizedQuestion;
}
