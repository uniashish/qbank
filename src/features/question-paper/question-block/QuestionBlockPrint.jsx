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
      <QuestionBlockContent
        marksLabel={marksLabel}
        mode="print"
        questionNumber={questionNumber}
        showInstructions
        snapshot={attrs.snapshot}
      />
    </NodeViewWrapper>
  );
}

export default QuestionBlockPrint;
