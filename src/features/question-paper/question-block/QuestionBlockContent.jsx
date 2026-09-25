import RichDocumentRenderer from "../../../components/rich-editor/RichDocumentRenderer.jsx";
import { getOptionLabel } from "../../question-designer/constants/optionLabels.js";
import { QUESTION_TYPES } from "../../question-designer/constants/questionTypes.js";
import { createMatchDisplayModel } from "../../question-designer/utils/matchPairHelpers.js";
import { normalizeRichTextContent } from "../../question-designer/utils/richTextContent.js";
import { getQuestionBlockPromptContent } from "../nodes/questionBlockUtils.js";

function RichQuestionContent({ ariaLabel, className, content, fallbackText, mode }) {
  return (
    <RichDocumentRenderer
      ariaLabel={ariaLabel}
      className={className}
      content={normalizeRichTextContent(content, fallbackText)}
      mode={mode}
    />
  );
}

const DESIGNER_CONTENT_CLASSES = {
  instructions: "question-block-node__instructions",
  matchColumn: "question-block-node__match-column",
  matchColumns: "question-block-node__match-columns",
  matchContent: "question-block-node__match-content",
  matchHeading: "question-block-node__match-heading",
  matchItem: "question-block-node__match-item",
  matchList: "question-block-node__match-list",
  option: "question-block-node__option",
  optionContent: "question-block-node__option-content",
  options: "question-block-node__options",
  prompt: "question-block-node__prompt",
  promptContent: "question-block-node__prompt-content",
  questionNumber: "",
};

const PRINT_CONTENT_CLASSES = {
  instructions: "paper-question-instructions",
  matchCellContent: "paper-match-content",
  matchItem: "paper-match-item",
  matchLabel: "paper-match-label",
  matchTable: "paper-match-table",
  option: "paper-option",
  optionContent: "paper-option-content",
  options: "paper-question-options",
  prompt: "paper-question-prompt",
  promptContent: "paper-question-content",
  questionNumber: "paper-question-number",
};

function getContentClasses(mode) {
  return mode === "print" ? PRINT_CONTENT_CLASSES : DESIGNER_CONTENT_CLASSES;
}

function MultipleChoiceContent({ answerData = {}, classes, mode }) {
  const options = Array.isArray(answerData.options) ? answerData.options : [];

  if (options.length === 0) {
    return null;
  }

  return (
    <ol className={classes.options} type="A">
      {options.map((option, index) => (
        <li className={classes.option} key={option.id || index}>
          <RichQuestionContent
            ariaLabel={`Option ${getOptionLabel(index)} content`}
            className={classes.optionContent}
            content={option.content}
            fallbackText={option.text}
            mode={mode}
          />
        </li>
      ))}
    </ol>
  );
}

function TrueFalseContent({ mode }) {
  if (mode !== "print") {
    return null;
  }

  return <p className="paper-true-false-options">True / False</p>;
}

function PrintMatchFollowingContent({ displayModel, mode, rowCount }) {
  const rows = Array.from({ length: rowCount }, (_, index) => ({
    leftPair: displayModel.leftPairs[index] ?? null,
    rightPair: displayModel.rightPairs[index] ?? null,
  }));

  return (
    <table className={PRINT_CONTENT_CLASSES.matchTable}>
      <thead>
        <tr>
          <th scope="col">Column A</th>
          <th scope="col">Column B</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ leftPair, rightPair }, index) => (
          <tr key={`${leftPair?.id ?? "left"}-${rightPair?.id ?? "right"}-${index}`}>
            <td>
              {leftPair && (
                <div className={PRINT_CONTENT_CLASSES.matchItem}>
                  <span className={PRINT_CONTENT_CLASSES.matchLabel}>
                    {index + 1}.
                  </span>
                  <RichQuestionContent
                    ariaLabel={`Column A item ${index + 1}`}
                    className={PRINT_CONTENT_CLASSES.matchCellContent}
                    content={leftPair.leftContent}
                    fallbackText={leftPair.left}
                    mode={mode}
                  />
                </div>
              )}
            </td>
            <td>
              {rightPair && (
                <div className={PRINT_CONTENT_CLASSES.matchItem}>
                  <span className={PRINT_CONTENT_CLASSES.matchLabel}>
                    {getOptionLabel(index)}.
                  </span>
                  <RichQuestionContent
                    ariaLabel={`Column B item ${getOptionLabel(index)}`}
                    className={PRINT_CONTENT_CLASSES.matchCellContent}
                    content={rightPair.rightContent}
                    fallbackText={rightPair.right}
                    mode={mode}
                  />
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatchFollowingContent({ answerData = {}, classes, mode }) {
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

  if (mode === "print") {
    return (
      <PrintMatchFollowingContent
        displayModel={displayModel}
        mode={mode}
        rowCount={rowCount}
      />
    );
  }

  return (
    <div className={classes.matchColumns}>
      <div className={classes.matchColumn}>
        <span className={classes.matchHeading}>Column A</span>
        <ol className={classes.matchList}>
          {displayModel.leftPairs.map((pair, index) => (
            <li className={classes.matchItem} key={pair.id}>
              <span>{index + 1}.</span>
              <RichQuestionContent
                ariaLabel={`Column A item ${index + 1}`}
                className={classes.matchContent}
                content={pair.leftContent}
                fallbackText={pair.left}
                mode={mode}
              />
            </li>
          ))}
        </ol>
      </div>

      <div className={classes.matchColumn}>
        <span className={classes.matchHeading}>Column B</span>
        <ol className={classes.matchList}>
          {displayModel.rightPairs.map((pair, index) => (
            <li className={classes.matchItem} key={pair.id}>
              <span>{getOptionLabel(index)}.</span>
              <RichQuestionContent
                ariaLabel={`Column B item ${getOptionLabel(index)}`}
                className={classes.matchContent}
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

function QuestionAnswerStructure({ classes, mode, snapshot }) {
  const answerData = snapshot?.answerData ?? {};

  if (snapshot?.questionType === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return (
      <MultipleChoiceContent
        answerData={answerData}
        classes={classes}
        mode={mode}
      />
    );
  }

  if (snapshot?.questionType === QUESTION_TYPES.TRUE_FALSE) {
    return <TrueFalseContent mode={mode} />;
  }

  if (snapshot?.questionType === QUESTION_TYPES.MATCH_FOLLOWING) {
    return (
      <MatchFollowingContent
        answerData={answerData}
        classes={classes}
        mode={mode}
      />
    );
  }

  return null;
}

function getInstructions(snapshot) {
  const instructions = snapshot?.instructions;

  return typeof instructions === "string" ? instructions.trim() : "";
}

function QuestionBlockContent({
  mode = "preview",
  questionNumber = "",
  showInstructions = false,
  snapshot,
}) {
  const classes = getContentClasses(mode);
  const instructions = showInstructions ? getInstructions(snapshot) : "";

  if (mode === "print") {
    return (
      <div className="paper-question-main">
        <span className="paper-question-number">Q{questionNumber || "?"}.</span>
        <div className="paper-question-content">
          <RichDocumentRenderer
            ariaLabel={`Question ${questionNumber || "unknown"} prompt`}
            className="paper-question-prompt"
            content={getQuestionBlockPromptContent(snapshot)}
            mode={mode}
          />
          {instructions && (
            <p className={classes.instructions}>{instructions}</p>
          )}
          <QuestionAnswerStructure
            classes={classes}
            mode={mode}
            snapshot={snapshot}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={classes.prompt}>
        <strong className={classes.questionNumber || undefined}>
          Q{questionNumber || "?"}.
        </strong>
        <RichDocumentRenderer
          ariaLabel={`Question ${questionNumber || "unknown"} prompt`}
          className={classes.promptContent}
          content={getQuestionBlockPromptContent(snapshot)}
          mode={mode}
        />
      </div>
      {instructions && (
        <p className={classes.instructions}>{instructions}</p>
      )}
      <QuestionAnswerStructure
        classes={classes}
        mode={mode}
        snapshot={snapshot}
      />
    </>
  );
}

export default QuestionBlockContent;
