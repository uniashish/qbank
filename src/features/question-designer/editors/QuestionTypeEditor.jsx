import { getQuestionTypeOption, QUESTION_TYPES } from "../constants/questionTypes.js";
import FillBlanksEditor from "./fill-blanks/FillBlanksEditor.jsx";
import LongAnswerEditor from "./long-answer/LongAnswerEditor.jsx";
import MatchFollowingEditor from "./match-following/MatchFollowingEditor.jsx";
import MultipleChoiceEditor from "./multiple-choice/MultipleChoiceEditor.jsx";
import ShortAnswerEditor from "./short-answer/ShortAnswerEditor.jsx";
import TrueFalseEditor from "./true-false/TrueFalseEditor.jsx";

function UnsupportedQuestionType({ questionType }) {
  const selectedQuestionType = getQuestionTypeOption(questionType);

  return (
    <section
      className="question-designer-placeholder"
      aria-labelledby="unsupported-question-type-title"
    >
      <h3 id="unsupported-question-type-title">
        Answer setup for {selectedQuestionType?.title ?? "selected type"}
      </h3>
      <p>Coming in the next implementation phase.</p>
    </section>
  );
}

function QuestionTypeEditor({
  designerState,
  editorActions,
  validationErrors = {},
}) {
  switch (designerState.questionType) {
    case QUESTION_TYPES.FILL_BLANKS:
      return (
        <FillBlanksEditor
          editorActions={editorActions}
          fillBlanks={designerState.fillBlanks}
          prompt={designerState.prompt}
          questionImage={designerState.questionImage}
          validationErrors={validationErrors.fillBlanks}
        />
      );

    case QUESTION_TYPES.LONG_ANSWER:
      return (
        <LongAnswerEditor
          editorActions={editorActions}
          longAnswer={designerState.longAnswer}
          validationErrors={validationErrors.longAnswer}
        />
      );

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return (
        <MultipleChoiceEditor
          editorActions={editorActions}
          multipleChoice={designerState.multipleChoice}
          questionImage={designerState.questionImage}
          validationErrors={validationErrors.multipleChoice}
        />
      );

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return (
        <MatchFollowingEditor
          editorActions={editorActions}
          matchFollowing={designerState.matchFollowing}
          validationErrors={validationErrors.matchFollowing}
        />
      );

    case QUESTION_TYPES.SHORT_ANSWER:
      return (
        <ShortAnswerEditor
          editorActions={editorActions}
          shortAnswer={designerState.shortAnswer}
          validationErrors={validationErrors.shortAnswer}
        />
      );

    case QUESTION_TYPES.TRUE_FALSE:
      return (
        <TrueFalseEditor
          editorActions={editorActions}
          questionImage={designerState.questionImage}
          trueFalse={designerState.trueFalse}
          validationErrors={validationErrors.trueFalse}
        />
      );

    default:
      return <UnsupportedQuestionType questionType={designerState.questionType} />;
  }
}

export default QuestionTypeEditor;
