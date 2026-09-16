import QuestionTypeReview from "../../editors/review/QuestionTypeReview.jsx";
import { usesSharedPromptField } from "../../constants/questionTypes.js";
import QuestionImageReview from "./QuestionImageReview.jsx";
import ReviewEmptyValue from "./ReviewEmptyValue.jsx";
import ReviewField from "./ReviewField.jsx";
import ReviewSection from "./ReviewSection.jsx";

function QuestionReviewStep({ questionDraft }) {
  const hasQuestionImage = Boolean(
    questionDraft.questionImage?.previewUrl ||
      questionDraft.questionImage?.downloadUrl,
  );

  return (
    <section className="question-review-step" aria-labelledby="question-review-title">
      <div className="question-designer-section-header">
        <h3 id="question-review-title">Review Question</h3>
        <p>Check the final preview before saving is connected.</p>
      </div>

      <ReviewSection
        title="Question Details"
        titleId="question-review-details-title"
      >
        <dl className="question-review-metadata">
          <ReviewField
            label="Question Type"
            value={questionDraft.questionTypeLabel}
          />
          <ReviewField label="Class" value={questionDraft.className} />
          <ReviewField label="Subject" value={questionDraft.subjectName} />
          <ReviewField label="Topic" value={questionDraft.topicName} />
          <ReviewField label="Marks" value={questionDraft.marks} />
          <ReviewField
            label="Difficulty"
            value={questionDraft.difficultyLabel}
          />
        </dl>
      </ReviewSection>

      {usesSharedPromptField(questionDraft.questionType) && (
        <ReviewSection
          className="question-review-section--prompt"
          title="Question Prompt"
          titleId="question-review-prompt-title"
        >
          <p className="question-review-prompt">{questionDraft.prompt}</p>
        </ReviewSection>
      )}

      <ReviewSection
        title="Instructions"
        titleId="question-review-instructions-title"
      >
        {questionDraft.instructions ? (
          <p className="question-review-instructions">
            {questionDraft.instructions}
          </p>
        ) : (
          <ReviewEmptyValue>No additional instructions</ReviewEmptyValue>
        )}
      </ReviewSection>

      {hasQuestionImage && (
        <ReviewSection
          title="Question Image"
          titleId="question-review-image-title"
        >
          <QuestionImageReview image={questionDraft.questionImage} />
        </ReviewSection>
      )}

      <QuestionTypeReview questionDraft={questionDraft} />
    </section>
  );
}

export default QuestionReviewStep;
