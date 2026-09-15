import {
  DIFFICULTY_LEVEL_OPTIONS,
} from "../constants/difficultyLevels.js";
import { getQuestionTypeOption, QUESTION_TYPES } from "../constants/questionTypes.js";

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
      id: option.id,
      order: index,
      text: trimText(option.text),
    })),
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

function createAnswerData(designerState) {
  switch (designerState.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return createFillBlanksAnswerData(designerState.fillBlanks);

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return createMultipleChoiceAnswerData(designerState.multipleChoice);

    case QUESTION_TYPES.TRUE_FALSE:
      return createTrueFalseAnswerData(designerState.trueFalse);

    default:
      return null;
  }
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
    prompt: trimText(designerState.prompt),
    questionImage: designerState.questionImage,
    questionType: designerState.questionType,
    questionTypeLabel: questionTypeOption?.title ?? "",
    subjectId: designerState.subjectId,
    subjectName: resolveSubjectName(
      designerState.classId,
      designerState.subjectId,
      assignmentState,
    ),
    topicName: trimText(designerState.topicName),
  };
}
