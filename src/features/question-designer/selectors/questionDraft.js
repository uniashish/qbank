import {
  DIFFICULTY_LEVEL_OPTIONS,
} from "../constants/difficultyLevels.js";
import {
  getQuestionTypeOption,
  QUESTION_TYPES,
  usesRichQuestionContent,
} from "../constants/questionTypes.js";
import {
  normalizeSuggestedWordCount,
} from "../editors/long-answer/longAnswerValidation.js";
import { createPersistableMatchPairs } from "../utils/matchPairHelpers.js";
import {
  cloneRichTextContent,
  getRichTextPlainText,
  normalizeRichTextContent,
} from "../utils/richTextContent.js";
import { sanitizeTags } from "../../../components/tags/tagUtils.js";

function trimText(value) {
  return String(value ?? "").trim();
}

function resolveClassName(classId, assignmentState = {}) {
  if (!classId) {
    return "";
  }

  const classOption = assignmentState.classOptions?.find(
    (option) => option.id === classId,
  );

  return classOption?.label ?? classOption?.record?.name ?? "";
}

function resolveSubjectName(classId, subjectId, assignmentState = {}) {
  if (!classId || !subjectId || !assignmentState.getSubjectsForClass) {
    return "";
  }

  const subject = assignmentState
    .getSubjectsForClass(classId)
    .find((subjectOption) => subjectOption.id === subjectId);

  return subject?.name ?? "";
}

function resolveDifficultyLabel(difficulty) {
  return (
    DIFFICULTY_LEVEL_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? ""
  );
}

function createMultipleChoiceAnswerData(multipleChoice = {}) {
  return {
    correctOptionId: multipleChoice.correctOptionId ?? null,
    options: (multipleChoice.options ?? []).map((option, index) => ({
      content: normalizeRichTextContent(option.content, option.text ?? ""),
      id: option.id,
      order: index,
      text: trimText(option.text || getRichTextPlainText(option.content)),
    })),
  };
}

function createMatchFollowingAnswerData(matchFollowing = {}) {
  return {
    pairs: createPersistableMatchPairs(matchFollowing.pairs),
  };
}

function createFillBlanksAnswerData(fillBlanks = {}) {
  return {
    blanks: (fillBlanks.blanks ?? []).map((blank) => ({
      id: blank.id,
      acceptedAnswers: (blank.acceptedAnswers ?? []).map((answer) =>
        trimText(answer),
      ),
    })),
  };
}

function createTrueFalseAnswerData(trueFalse = {}) {
  return {
    correctAnswer:
      trueFalse.correctAnswer === true || trueFalse.correctAnswer === false
        ? trueFalse.correctAnswer
        : null,
  };
}

function createShortAnswerAnswerData(shortAnswer = {}) {
  return {
    modelAnswer: cloneRichTextContent(shortAnswer.modelAnswer),
    questionContent: cloneRichTextContent(shortAnswer.questionContent),
  };
}

function createLongAnswerAnswerData(longAnswer = {}) {
  return {
    modelAnswer: cloneRichTextContent(longAnswer.modelAnswer),
    questionContent: cloneRichTextContent(longAnswer.questionContent),
    suggestedWordCount: normalizeSuggestedWordCount(
      longAnswer.suggestedWordCount,
    ),
  };
}

function createAnswerData(designerState) {
  switch (designerState.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return createFillBlanksAnswerData(designerState.fillBlanks);

    case QUESTION_TYPES.LONG_ANSWER:
      return createLongAnswerAnswerData(designerState.longAnswer);

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return createMultipleChoiceAnswerData(designerState.multipleChoice);

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return createMatchFollowingAnswerData(designerState.matchFollowing);

    case QUESTION_TYPES.SHORT_ANSWER:
      return createShortAnswerAnswerData(designerState.shortAnswer);

    case QUESTION_TYPES.TRUE_FALSE:
      return createTrueFalseAnswerData(designerState.trueFalse);

    default:
      return null;
  }
}

function createQuestionPrompt(designerState) {
  if (!usesRichQuestionContent(designerState.questionType)) {
    return trimText(designerState.prompt);
  }

  if (designerState.questionType === QUESTION_TYPES.LONG_ANSWER) {
    return getRichTextPlainText(designerState.longAnswer?.questionContent);
  }

  return getRichTextPlainText(designerState.shortAnswer?.questionContent);
}

function createQuestionPromptContent(designerState) {
  if (!usesRichQuestionContent(designerState.questionType)) {
    return normalizeRichTextContent(
      designerState.promptContent,
      designerState.prompt,
    );
  }

  return null;
}

export function createQuestionDraft(designerState, assignmentState = {}) {
  const questionTypeOption = getQuestionTypeOption(designerState.questionType);

  return {
    answerData: createAnswerData(designerState),
    classId: designerState.classId,
    className: resolveClassName(designerState.classId, assignmentState),
    difficulty: designerState.difficulty,
    difficultyLabel: resolveDifficultyLabel(designerState.difficulty),
    instructions: trimText(designerState.instructions),
    marks: Number(designerState.marks),
    prompt: createQuestionPrompt(designerState),
    promptContent: createQuestionPromptContent(designerState),
    questionImage: designerState.questionImage,
    questionType: designerState.questionType,
    questionTypeLabel: questionTypeOption?.title ?? "",
    subjectId: designerState.subjectId,
    subjectName: resolveSubjectName(
      designerState.classId,
      designerState.subjectId,
      assignmentState,
    ),
    tags: sanitizeTags(designerState.tags),
    topicName: trimText(designerState.topicName),
  };
}
