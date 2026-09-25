import { NodeViewWrapper } from "@tiptap/react";

import { normalizePositiveWholeNumber } from "../nodes/questionBlockUtils.js";
import QuestionBlockContent from "./QuestionBlockContent.jsx";

function QuestionBlockPrint({ node }) {
  const attrs = node.attrs;
  const questionNumber = attrs.questionNumber || "";
  const marks = normalizePositiveWholeNumber(attrs.marks);
  const marksLabel = `${marks} mark${marks === 1 ? "" : "s"}`;

  return (
    <NodeViewWrapper
      as="section"
      className="paper-question"
      contentEditable={false}
      data-question-block-id={attrs.blockId}
    >
      <div className="paper-question-header">
        <div className="paper-question-main">
          <QuestionBlockContent
            mode="print"
            questionNumber={questionNumber}
            showInstructions
            snapshot={attrs.snapshot}
          />
        </div>
        <span className="paper-question-marks">[{marksLabel}]</span>
      </div>
    </NodeViewWrapper>
  );
}

export default QuestionBlockPrint;
