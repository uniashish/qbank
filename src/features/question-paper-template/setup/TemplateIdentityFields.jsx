import FormField from "../../../components/common/FormField.jsx";

function TemplateIdentityFields({ errors, onFieldChange, values }) {
  const nameFieldId = "question-paper-template-name";
  const descriptionFieldId = "question-paper-template-description";

  return (
    <section
      aria-labelledby="template-details-title"
      className="question-paper-template-setup-section"
    >
      <div className="question-paper-template-setup-section__header">
        <h2 id="template-details-title">Template Details</h2>
      </div>

      <div className="question-paper-template-setup-grid">
        <FormField
          error={errors.name}
          htmlFor={nameFieldId}
          label="Template Name"
          required
        >
          <input
            aria-describedby={
              errors.name ? `${nameFieldId}-error` : undefined
            }
            aria-invalid={Boolean(errors.name)}
            className="input"
            id={nameFieldId}
            onChange={(event) => onFieldChange("name", event.target.value)}
            placeholder="Grade 10 Midterm Template"
            type="text"
            value={values.name}
          />
        </FormField>

        <FormField htmlFor={descriptionFieldId} label="Description">
          <textarea
            className="input question-paper-template-setup-textarea"
            id={descriptionFieldId}
            onChange={(event) =>
              onFieldChange("description", event.target.value)
            }
            placeholder="Reusable format for midterm question papers"
            rows={4}
            value={values.description}
          />
        </FormField>
      </div>
    </section>
  );
}

export default TemplateIdentityFields;
