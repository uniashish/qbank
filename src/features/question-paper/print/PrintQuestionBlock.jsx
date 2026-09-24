import { NodeViewWrapper } from "@tiptap/react";

import {
  getQuestionBlockPrompt,
  normalizePositiveWholeNumber,
} from "../nodes/questionBlockUtils.js";

function PrintQuestionBlock({ node }) {
  const attrs = node.attrs;
  const prompt = getQuestionBlockPrompt(attrs.snapshot);
  const questionNumber = attrs.questionNumber || "";
  const marks = normalizePositiveWholeNumber(attrs.marks);

  return (
    <NodeViewWrapper
      as="section"
      className="question-block-node question-block-node--print"
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
    </NodeViewWrapper>
  );
}

export default PrintQuestionBlock;
