import { useEffect, useMemo, useRef } from "react";

import Icon from "../common/Icon.jsx";
import { DIFFICULTY_LEVEL_OPTIONS } from "../../features/question-designer/constants/difficultyLevels.js";
import { getQuestionTypeOption } from "../../features/question-designer/constants/questionTypes.js";
import QuestionReviewStep from "../../features/question-designer/components/review/QuestionReviewStep.jsx";
import SharedQuestionBadge from "../../features/question-sharing/SharedQuestionBadge.jsx";
import { sanitizeTags } from "../tags/tagUtils.js";

function resolveDifficultyLabel(difficulty) {
  return (
    DIFFICULTY_LEVEL_OPTIONS.find((option) => option.value === difficulty)
      ?.label ?? "Unknown"
  );
}

function createPreviewDraft(question) {
  const questionTypeOption = getQuestionTypeOption(question.questionType);

  return {
    answerData: question.answerData,
    classId: question.classId,
    className: question.className,
    difficulty: question.difficulty,
    difficultyLabel: question.difficultyLabel ?? resolveDifficultyLabel(question.difficulty),
    instructions: question.instructions ?? "",
    marks: Number(question.marks),
    prompt: question.prompt ?? "",
    questionImage: {
      downloadUrl: question.image?.downloadUrl ?? null,
      error: "",
      file: null,
      isLoading: false,
      previewUrl: null,
      storagePath: question.image?.storagePath ?? null,
    },
    questionType: question.questionType,
    questionTypeLabel: question.questionTypeLabel ?? questionTypeOption?.title ?? "",
    subjectId: question.subjectId,
    subjectName: question.subjectName,
    tags: sanitizeTags(question.tags),
    topicName: question.topicName ?? "",
  };
}

function QuestionPreviewDialog({ onClose, question }) {
  const dialogRef = useRef(null);
  const questionDraft = useMemo(
    () => (question ? createPreviewDraft(question) : null),
    [question],
  );

  useEffect(() => {
    if (!question) {
      return undefined;
    }

    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, question]);

  if (!question || !questionDraft) {
    return null;
  }

  return (
    <div className="question-designer-overlay" role="presentation">
      <button
        aria-label="Close question preview"
        className="question-designer-backdrop"
        onClick={onClose}
        tabIndex={-1}
        type="button"
      />
      <section
        aria-labelledby="question-preview-title"
        aria-modal="true"
        className="question-preview-dialog"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="question-preview-dialog__header">
          <div>
            <p className="question-designer-header__eyebrow">Question Preview</p>
            <h2 id="question-preview-title">View Question</h2>
            {question.access?.type === "shared" && (
              <div className="question-preview-dialog__share">
                <SharedQuestionBadge ownerName={question.shareInfo?.ownerName} />
                {question.shareInfo?.ownerName && (
                  <span>Owner: {question.shareInfo.ownerName}</span>
                )}
              </div>
            )}
          </div>
          <button
            aria-label="Close question preview"
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="question-preview-dialog__body">
          <QuestionReviewStep questionDraft={questionDraft} />
        </div>
      </section>
    </div>
  );
}

export default QuestionPreviewDialog;
