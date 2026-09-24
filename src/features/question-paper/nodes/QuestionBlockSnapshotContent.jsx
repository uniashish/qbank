import RichDocumentRenderer from "../../../components/rich-editor/RichDocumentRenderer.jsx";
import { getOptionLabel } from "../../question-designer/constants/optionLabels.js";
import { QUESTION_TYPES } from "../../question-designer/constants/questionTypes.js";
import { createMatchDisplayModel } from "../../question-designer/utils/matchPairHelpers.js";
import { normalizeRichTextContent } from "../../question-designer/utils/richTextContent.js";
import { getQuestionBlockPromptContent } from "./questionBlockUtils.js";

function RichSnapshotContent({ ariaLabel, className, content, fallbackText, mode }) {
  return (
    <RichDocumentRenderer
      ariaLabel={ariaLabel}
      className={className}
      content={normalizeRichTextContent(content, fallbackText)}
      mode={mode}
    />
  );
}

function MultipleChoiceSnapshotContent({ answerData = {}, mode }) {
  const options = Array.isArray(answerData.options) ? answerData.options : [];

  if (options.length === 0) {
    return null;
  }

  return (
    <ol className="question-block-node__options" type="A">
      {options.map((option, index) => (
        <li className="question-block-node__option" key={option.id || index}>
          <RichSnapshotContent
            ariaLabel={`Option ${getOptionLabel(index)} content`}
            className="question-block-node__option-content"
            content={option.content}
            fallbackText={option.text}
            mode={mode}
          />
        </li>
      ))}
    </ol>
  );
}

function MatchFollowingSnapshotContent({ answerData = {}, mode }) {
  const pairs = Array.isArray(answerData.pairs) ? answerData.pairs : [];
  const displayModel = createMatchDisplayModel(
    pairs,
    answerData.columnBDisplayOrder,
  );
  const rowCount = Math.max(
    displayModel.leftPairs.length,
    displayModel.rightPairs.length,
  );

  if (rowCount === 0) {
    return null;
  }

  return (
    <div className="question-block-node__match-columns">
      <div className="question-block-node__match-column">
        <span className="question-block-node__match-heading">Column A</span>
        <ol className="question-block-node__match-list">
          {displayModel.leftPairs.map((pair, index) => (
            <li className="question-block-node__match-item" key={pair.id}>
              <span>{index + 1}.</span>
              <RichSnapshotContent
                ariaLabel={`Column A item ${index + 1}`}
                className="question-block-node__match-content"
                content={pair.leftContent}
                fallbackText={pair.left}
                mode={mode}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className="question-block-node__match-column">
        <span className="question-block-node__match-heading">Column B</span>
        <ol className="question-block-node__match-list">
          {displayModel.rightPairs.map((pair, index) => (
            <li className="question-block-node__match-item" key={pair.id}>
              <span>{getOptionLabel(index)}.</span>
              <RichSnapshotContent
                ariaLabel={`Column B item ${getOptionLabel(index)}`}
                className="question-block-node__match-content"
                content={pair.rightContent}
                fallbackText={pair.right}
                mode={mode}
              />
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function QuestionTypeSnapshotContent({ mode, snapshot }) {
  const answerData = snapshot?.answerData ?? {};

  if (snapshot?.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return (
      <MultipleChoiceSnapshotContent
        answerData={answerData}
        mode={mode}
      />
    );
  }

  if (snapshot?.questionType === QUESTION_TYPES.MATCH_FOLLOWING) {
    return (
      <MatchFollowingSnapshotContent
        answerData={answerData}
        mode={mode}
      />
    );
  }

  return null;
}

function QuestionBlockSnapshotContent({
  mode = "preview",
  questionNumber = "",
  snapshot,
}) {
  return (
    <>
      <div className="question-block-node__prompt">
        <strong>Q{questionNumber || "?"}.</strong>
        <RichDocumentRenderer
          ariaLabel={`Question ${questionNumber || "unknown"} prompt`}
          className="question-block-node__prompt-content"
          content={getQuestionBlockPromptContent(snapshot)}
          mode={mode}
        />
      </div>
      <QuestionTypeSnapshotContent mode={mode} snapshot={snapshot} />
    </>
  );
}

export default QuestionBlockSnapshotContent;
