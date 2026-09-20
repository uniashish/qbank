import FormField from "../../../components/common/FormField.jsx";

function PaperExamSettingsFields({ errors, onFieldChange, values }) {
  return (
    <section
      className="question-paper-setup-section"
      aria-labelledby="exam-settings-title"
    >
      <div className="question-paper-setup-section__header">
        <h2 id="exam-settings-title">Exam Settings</h2>
        <p>Optional limits for duration and scoring.</p>
      </div>

      <div className="question-paper-setup-grid question-paper-setup-grid--two">
        <FormField
          error={errors.durationMinutes}
          htmlFor="question-paper-duration"
          label="Duration (minutes)"
        >
          <input
            aria-describedby={
              errors.durationMinutes
                ? "question-paper-duration-error"
                : undefined
            }
            aria-invalid={Boolean(errors.durationMinutes)}
            className="input"
            id="question-paper-duration"
            inputMode="numeric"
            min="1"
            onChange={(event) =>
              onFieldChange("durationMinutes", event.target.value || null)
            }
            step="1"
            type="number"
            value={values.durationMinutes ?? ""}
          />
        </FormField>

        <FormField
          error={errors.maximumMarks}
          htmlFor="question-paper-maximum-marks"
          label="Maximum Marks"
        >
          <input
            aria-describedby={
              errors.maximumMarks
                ? "question-paper-maximum-marks-error"
                : undefined
            }
            aria-invalid={Boolean(errors.maximumMarks)}
            className="input"
            id="question-paper-maximum-marks"
            inputMode="numeric"
            min="1"
            onChange={(event) =>
              onFieldChange("maximumMarks", event.target.value || null)
            }
            step="1"
            type="number"
            value={values.maximumMarks ?? ""}
          />
        </FormField>
      </div>
    </section>
  );
}

export default PaperExamSettingsFields;
