import { NodeViewWrapper } from "@tiptap/react";

import QuestionBlockToolbar from "./QuestionBlockToolbar.jsx";
import {
  canMoveQuestionBlock,
  getQuestionBlockPrompt,
  moveQuestionBlock,
  normalizePositiveWholeNumber,
} from "./questionBlockUtils.js";

function QuestionBlockView({
  deleteNode,
  editor,
  getPos,
  node,
  selected = false,
  updateAttributes,
}) {
  const attrs = node.attrs;
  const prompt = getQuestionBlockPrompt(attrs.snapshot);
  const questionNumber = attrs.questionNumber || "";
  const marks = normalizePositiveWholeNumber(attrs.marks);
  const isReadOnly = !editor?.isEditable;
  const canMoveUp = canMoveQuestionBlock({
    direction: "up",
    editor,
    getPos,
  });
  const canMoveDown = canMoveQuestionBlock({
    direction: "down",
    editor,
    getPos,
  });

  function handleMarksChange(value) {
    if (!/^\d+$/.test(String(value))) {
      return;
    }

    updateAttributes({
      marks: normalizePositiveWholeNumber(value, marks),
    });
  }

  return (
    <NodeViewWrapper
      as="section"
      className={[
        "question-block-node",
        selected ? "question-block-node--selected" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      contentEditable={false}
      data-question-block-id={attrs.blockId}
    >
      <div className="question-block-node__body">
        <div className="question-block-node__content">
          <p className="question-block-node__prompt">
            <strong>Q{questionNumber || "?"}.</strong> {prompt}
          </p>
          <div className="question-block-node__meta">
            {attrs.questionType && <span>{attrs.questionType}</span>}
            {attrs.difficulty && <span>{attrs.difficulty}</span>}
            {attrs.questionId && <span>{attrs.questionId}</span>}
          </div>
        </div>
        <span className="question-block-node__marks">
          {marks} mark{marks === 1 ? "" : "s"}
        </span>
      </div>

      {!isReadOnly && (
        <QuestionBlockToolbar
          canMoveDown={canMoveDown}
          canMoveUp={canMoveUp}
          marks={marks}
          onMarksChange={handleMarksChange}
          onMoveDown={() =>
            moveQuestionBlock({ direction: "down", editor, getPos })
          }
          onMoveUp={() => moveQuestionBlock({ direction: "up", editor, getPos })}
          onRemove={deleteNode}
          questionNumber={questionNumber}
        />
      )}
    </NodeViewWrapper>
  );
}

export default QuestionBlockView;
