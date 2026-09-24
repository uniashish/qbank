import { NodeViewWrapper } from "@tiptap/react";

import { normalizePositiveWholeNumber } from "../nodes/questionBlockUtils.js";
import QuestionBlockContent from "./QuestionBlockContent.jsx";

function QuestionBlockPrint({ node }) {
  const attrs = node.attrs;
  const questionNumber = attrs.questionNumber || "";
  const marks = normalizePositiveWholeNumber(attrs.marks);

  return (
    <NodeViewWrapper
      as="section"
      className="question-block-node question-block-node--print"
      contentEditable={false}
    >
      <div className="question-block-node__body">
        <div className="question-block-node__content">
          <QuestionBlockContent
            mode="print"
            questionNumber={questionNumber}
            showInstructions
            snapshot={attrs.snapshot}
          />
        </div>
        <span className="question-block-node__marks">
          {marks} mark{marks === 1 ? "" : "s"}
        </span>
      </div>
    </NodeViewWrapper>
  );
}

export default QuestionBlockPrint;
