import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import PageContainer from "../../../components/layout/PageContainer.jsx";
import TemplateSetupForm from "../setup/TemplateSetupForm.jsx";
import {
  createInitialTemplateSetupValues,
  validateTemplateSetup,
} from "../setup/templateSetupValidation.js";

function areTemplateSetupValuesEqual(firstValues, secondValues) {
  const firstDefaultSetup = firstValues.defaultSetup ?? {};
  const secondDefaultSetup = secondValues.defaultSetup ?? {};

  return (
    firstValues.name === secondValues.name &&
    firstValues.description === secondValues.description &&
    firstDefaultSetup.examName === secondDefaultSetup.examName &&
    firstDefaultSetup.term === secondDefaultSetup.term &&
    firstDefaultSetup.academicYear === secondDefaultSetup.academicYear &&
    firstDefaultSetup.durationMinutes === secondDefaultSetup.durationMinutes &&
    firstDefaultSetup.maximumMarks === secondDefaultSetup.maximumMarks
  );
}

function CreateQuestionPaperTemplatePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [initialSetupValues] = useState(() =>
    createInitialTemplateSetupValues(location.state?.templateSetup),
  );
  const [setupValues, setSetupValues] = useState(initialSetupValues);
  const [errors, setErrors] = useState({});

  const hasUnsavedChanges = useMemo(
    () => !areTemplateSetupValuesEqual(setupValues, initialSetupValues),
    [initialSetupValues, setupValues],
  );

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

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

  const handleDefaultSetupChange = useCallback((fieldName, value) => {
    setSetupValues((currentValues) => ({
      ...currentValues,
      defaultSetup: {
        ...currentValues.defaultSetup,
        [fieldName]: value,
      },
    }));
    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  }, []);

  const handleCancel = useCallback(() => {
    navigate("/teacher/exam-papers/templates");
  }, [navigate]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const validation = validateTemplateSetup(setupValues);

      setErrors(validation.errors);

      if (!validation.isValid) {
        return;
      }

      navigate("/teacher/exam-papers/templates/new/design", {
        state: {
          templateSetup: validation.values,
        },
      });
    },
    [navigate, setupValues],
  );

  return (
    <PageContainer
      className="question-paper-template-page question-paper-template-setup-page"
      size="narrow"
    >
      <header className="question-paper-template-header question-paper-template-setup-header">
        <div>
          <p className="question-paper-template-header__eyebrow">
            Question Paper Templates
          </p>
          <h1>Create Template</h1>
          <p>Set reusable template details before opening the designer.</p>
        </div>
      </header>

      <section className="teacher-dashboard-card question-paper-template-panel question-paper-template-setup-panel">
        <TemplateSetupForm
          errors={errors}
          onCancel={handleCancel}
          onDefaultSetupChange={handleDefaultSetupChange}
          onFieldChange={handleFieldChange}
          onSubmit={handleSubmit}
          values={setupValues}
        />
      </section>
    </PageContainer>
  );
}

export default CreateQuestionPaperTemplatePage;
