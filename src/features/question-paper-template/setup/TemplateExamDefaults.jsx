import FormField from "../../../components/common/FormField.jsx";

function TemplateExamDefaults({ errors, onDefaultSetupChange, values }) {
  const defaultSetup = values.defaultSetup;

  return (
    <section
      aria-labelledby="template-default-exam-settings-title"
      className="question-paper-template-setup-section"
    >
      <div className="question-paper-template-setup-section__header">
        <h2 id="template-default-exam-settings-title">
          Default Exam Settings
        </h2>
      </div>

      <div className="question-paper-template-setup-grid question-paper-template-setup-grid--two">
        <FormField
          htmlFor="question-paper-template-default-exam-name"
          label="Default Exam Name"
        >
          <input
            className="input"
            id="question-paper-template-default-exam-name"
            onChange={(event) =>
              onDefaultSetupChange("examName", event.target.value)
            }
            placeholder="Midterm Examination"
            type="text"
            value={defaultSetup.examName}
          />
        </FormField>

        <FormField
          htmlFor="question-paper-template-default-term"
          label="Default Term"
        >
          <input
            className="input"
            id="question-paper-template-default-term"
            onChange={(event) =>
              onDefaultSetupChange("term", event.target.value)
            }
            placeholder="Term 1"
            type="text"
            value={defaultSetup.term}
          />
        </FormField>

        <FormField
          htmlFor="question-paper-template-default-academic-year"
          label="Default Academic Year"
        >
          <input
            className="input"
            id="question-paper-template-default-academic-year"
            onChange={(event) =>
              onDefaultSetupChange("academicYear", event.target.value)
            }
            placeholder="2026-2027"
            type="text"
            value={defaultSetup.academicYear}
          />
        </FormField>

        <FormField
          error={errors.durationMinutes}
          htmlFor="question-paper-template-default-duration"
          label="Default Duration"
        >
          <input
            aria-describedby={
              errors.durationMinutes
                ? "question-paper-template-default-duration-error"
                : undefined
            }
            aria-invalid={Boolean(errors.durationMinutes)}
            className="input"
            id="question-paper-template-default-duration"
            inputMode="numeric"
            min="1"
            onChange={(event) =>
              onDefaultSetupChange(
                "durationMinutes",
                event.target.value || null,
              )
            }
            placeholder="90"
            step="1"
            type="number"
            value={defaultSetup.durationMinutes ?? ""}
          />
        </FormField>

        <FormField
          error={errors.maximumMarks}
          htmlFor="question-paper-template-default-maximum-marks"
          label="Default Maximum Marks"
        >
          <input
            aria-describedby={
              errors.maximumMarks
                ? "question-paper-template-default-maximum-marks-error"
                : undefined
            }
            aria-invalid={Boolean(errors.maximumMarks)}
            className="input"
            id="question-paper-template-default-maximum-marks"
            inputMode="numeric"
            min="1"
            onChange={(event) =>
              onDefaultSetupChange("maximumMarks", event.target.value || null)
            }
            placeholder="100"
            step="1"
            type="number"
            value={defaultSetup.maximumMarks ?? ""}
          />
        </FormField>
      </div>
    </section>
  );
}

export default TemplateExamDefaults;
