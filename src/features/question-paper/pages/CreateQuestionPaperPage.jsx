import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useTeacherQuestionAssignments } from "../../question-designer/hooks/useTeacherQuestionAssignments.js";
import QuestionPaperSetupForm from "../setup/QuestionPaperSetupForm.jsx";
import {
  INITIAL_PAPER_SETUP_VALUES,
  validateQuestionPaperSetup,
} from "../setup/paperSetupValidation.js";

function createInitialSetupValues(paperSetup = {}) {
  return {
    title: paperSetup.title ?? INITIAL_PAPER_SETUP_VALUES.title,
    classId: paperSetup.classId ?? INITIAL_PAPER_SETUP_VALUES.classId,
    subjectId: paperSetup.subjectId ?? INITIAL_PAPER_SETUP_VALUES.subjectId,
    examName: paperSetup.examName ?? INITIAL_PAPER_SETUP_VALUES.examName,
    term: paperSetup.term ?? INITIAL_PAPER_SETUP_VALUES.term,
    academicYear:
      paperSetup.academicYear ?? INITIAL_PAPER_SETUP_VALUES.academicYear,
    durationMinutes:
      paperSetup.durationMinutes ?? INITIAL_PAPER_SETUP_VALUES.durationMinutes,
    maximumMarks:
      paperSetup.maximumMarks ?? INITIAL_PAPER_SETUP_VALUES.maximumMarks,
  };
}

function CreateQuestionPaperPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const assignmentState = useTeacherQuestionAssignments();
  const [setupValues, setSetupValues] = useState(() =>
    createInitialSetupValues(location.state?.paperSetup),
  );
  const [errors, setErrors] = useState({});

  const subjectOptions = useMemo(
    () => assignmentState.getSubjectsForClass(setupValues.classId),
    [assignmentState, setupValues.classId],
  );

  const handleFieldChange = useCallback((fieldName, value) => {
    setSetupValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value,
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  }, []);

  const handleClassChange = useCallback(
    (classId) => {
      const nextClassId = classId || "";
      const validSubjectIds = assignmentState.getSubjectIdsForClass(nextClassId);

      setSetupValues((currentValues) => ({
        ...currentValues,
        classId: nextClassId,
        subjectId: validSubjectIds.includes(currentValues.subjectId)
          ? currentValues.subjectId
          : "",
      }));
      setErrors((currentErrors) => ({
        ...currentErrors,
        classId: "",
        subjectId: "",
      }));
    },
    [assignmentState],
  );

  const handleCancel = useCallback(() => {
    navigate("/teacher/exam-papers");
  }, [navigate]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const validation = validateQuestionPaperSetup(setupValues, assignmentState);

      setErrors(validation.errors);

      if (!validation.isValid) {
        return;
      }

      const selectedClass = assignmentState.classOptions.find(
        (classOption) => classOption.id === validation.values.classId,
      );
      const selectedSubject = assignmentState
        .getSubjectsForClass(validation.values.classId)
        .find((subject) => subject.id === validation.values.subjectId);

      navigate("/teacher/exam-papers/new/design", {
        state: {
          paperSetup: {
            ...validation.values,
            className: selectedClass?.label ?? "",
            subjectName: selectedSubject?.name ?? "",
          },
        },
      });
    },
    [assignmentState, navigate, setupValues],
  );

  return (
    <PageContainer className="question-papers-page question-paper-setup-page">
      <header className="question-papers-header question-paper-setup-header">
        <div>
          <p className="question-papers-header__eyebrow">Exam Papers</p>
          <h1>Create New Paper</h1>
          <p>Start with paper metadata before choosing questions.</p>
        </div>
      </header>

      <section className="teacher-dashboard-card question-papers-panel question-paper-setup-panel">
        <QuestionPaperSetupForm
          assignmentState={assignmentState}
          errors={errors}
          onCancel={handleCancel}
          onClassChange={handleClassChange}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          subjectOptions={subjectOptions}
          values={setupValues}
        />
      </section>
    </PageContainer>
  );
}

export default CreateQuestionPaperPage;
