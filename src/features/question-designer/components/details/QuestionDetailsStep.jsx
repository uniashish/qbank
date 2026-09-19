import { useCallback, useEffect, useMemo } from "react";

import Spinner from "../../../../components/common/Spinner.jsx";
import TagInput from "../../../../components/tags/TagInput.jsx";
import { usesSharedPromptField } from "../../constants/questionTypes.js";
import AssignedClassField from "./AssignedClassField.jsx";
import AssignedSubjectField from "./AssignedSubjectField.jsx";
import DifficultyField from "./DifficultyField.jsx";
import InstructionsField from "./InstructionsField.jsx";
import MarksField from "./MarksField.jsx";
import QuestionPromptField from "./QuestionPromptField.jsx";
import TopicNameField from "./TopicNameField.jsx";

function QuestionDetailsState({ children, indicator, isError = false, title }) {
  return (
    <section
      aria-live="polite"
      className={[
        "question-details-state",
        isError ? "question-details-state--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={isError ? "alert" : "status"}
    >
      {indicator}
      <div>
        <h3>{title}</h3>
        {children}
      </div>
    </section>
  );
}

function QuestionDetailsStep({
  assignmentState,
  designerState,
  onClassChange,
  onFieldChange,
  onSubjectChange,
  validationErrors,
}) {
  const {
    classOptions,
    error: assignmentError,
    getSubjectIdsForClass,
    getSubjectsForClass,
    hasAssignments,
    isLoading,
  } = assignmentState;

  const subjectOptions = useMemo(
    () => getSubjectsForClass(designerState.classId),
    [designerState.classId, getSubjectsForClass],
  );

  const handleClassChange = useCallback(
    (classId) => {
      onClassChange(classId, getSubjectIdsForClass(classId));
    },
    [getSubjectIdsForClass, onClassChange],
  );

  useEffect(() => {
    if (isLoading || assignmentError) {
      return;
    }

    if (!designerState.classId) {
      return;
    }

    const classIsAssigned = classOptions.some(
      (classOption) => classOption.id === designerState.classId,
    );

    if (!classIsAssigned) {
      handleClassChange(null);
      return;
    }

    const subjectIdsForClass = getSubjectIdsForClass(designerState.classId);

    if (
      designerState.subjectId &&
      !subjectIdsForClass.includes(designerState.subjectId)
    ) {
      onSubjectChange(null);
    }
  }, [
    assignmentError,
    classOptions,
    designerState.classId,
    designerState.subjectId,
    getSubjectIdsForClass,
    handleClassChange,
    isLoading,
    onSubjectChange,
  ]);

  if (isLoading) {
    return (
      <QuestionDetailsState
        indicator={<Spinner label="Loading assigned classes and subjects" />}
        title="Loading assigned classes and subjects..."
      />
    );
  }

  if (assignmentError) {
    return (
      <QuestionDetailsState
        indicator={<span aria-hidden="true">!</span>}
        isError
        title={assignmentError}
      />
    );
  }

  if (!hasAssignments) {
    return (
      <QuestionDetailsState title="No classes and subjects are currently assigned to you.">
        <p>Contact your School Administrator before creating questions.</p>
      </QuestionDetailsState>
    );
  }

  return (
    <section className="question-details-step" aria-labelledby="question-details-title">
      <div className="question-designer-section-header">
        <h3 id="question-details-title">Question Details</h3>
        <p>Set the shared metadata for this question.</p>
      </div>

      <form
        className="question-details-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="question-details-grid question-details-grid--two">
          <AssignedClassField
            classOptions={classOptions}
            error={validationErrors.classId}
            onChange={handleClassChange}
            value={designerState.classId}
          />
          <AssignedSubjectField
            disabled={!designerState.classId}
            error={validationErrors.subjectId}
            onChange={onSubjectChange}
            subjectOptions={subjectOptions}
            value={designerState.subjectId}
          />
        </div>

        <TopicNameField
          error={validationErrors.topicName}
          onChange={(value) => onFieldChange("topicName", value)}
          value={designerState.topicName}
        />

        {usesSharedPromptField(designerState.questionType) && (
          <QuestionPromptField
            error={validationErrors.prompt}
            onChange={(value) => onFieldChange("prompt", value)}
            value={designerState.prompt}
          />
        )}

        <div className="question-details-grid question-details-grid--two">
          <MarksField
            error={validationErrors.marks}
            onChange={(value) => onFieldChange("marks", value)}
            value={designerState.marks}
          />
          <DifficultyField
            error={validationErrors.difficulty}
            onChange={(value) => onFieldChange("difficulty", value)}
            value={designerState.difficulty}
          />
        </div>

        <InstructionsField
          onChange={(value) => onFieldChange("instructions", value)}
          value={designerState.instructions}
        />

        <TagInput
          error={validationErrors.tags}
          id="question-details-tags"
          onChange={(tags) => onFieldChange("tags", tags)}
          value={designerState.tags}
        />
      </form>
    </section>
  );
}

export default QuestionDetailsStep;
