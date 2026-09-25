import { QUESTION_TYPES } from "../../question-designer/constants/questionTypes.js";
import FillBlanksAnswer from "./renderers/FillBlanksAnswer.jsx";
import LongAnswerAnswer from "./renderers/LongAnswerAnswer.jsx";
import MatchFollowingAnswer from "./renderers/MatchFollowingAnswer.jsx";
import MultipleChoiceAnswer from "./renderers/MultipleChoiceAnswer.jsx";
import ShortAnswerAnswer from "./renderers/ShortAnswerAnswer.jsx";
import TrueFalseAnswer from "./renderers/TrueFalseAnswer.jsx";

function renderAnswer(entry) {
  switch (entry.answer.kind) {
    case QUESTION_TYPES.FILL_BLANKS:
      return <FillBlanksAnswer answer={entry.answer} />;

    case QUESTION_TYPES.LONG_ANSWER:
      return <LongAnswerAnswer answer={entry.answer} />;

    case QUESTION_TYPES.MATCH_FOLLOWING:
      return <MatchFollowingAnswer answer={entry.answer} />;

    case QUESTION_TYPES.MULTIPLE_CHOICE:
      return <MultipleChoiceAnswer answer={entry.answer} />;

    case QUESTION_TYPES.SHORT_ANSWER:
      return <ShortAnswerAnswer answer={entry.answer} />;

    case QUESTION_TYPES.TRUE_FALSE:
      return <TrueFalseAnswer answer={entry.answer} />;

    default:
      return <p className="answer-key-empty">{entry.answer.message}</p>;
  }
}

function AnswerKeyQuestion({ entry, mode = "preview" }) {
  if (mode === "print") {
    return (
      <article className="paper-answer-key-question">
        <h2 className="paper-answer-key-number">{entry.questionNumber}.</h2>
        <div className="paper-answer-key-answer">{renderAnswer(entry)}</div>
      </article>
    );
  }

  return (
    <article className="answer-key-question">
      <h3>Question {entry.questionNumber}</h3>
      {renderAnswer(entry)}
    </article>
  );
}

export default AnswerKeyQuestion;
