import { useCallback, useId, useState } from "react";

import Button from "../../../components/common/Button.jsx";
import FormField from "../../../components/common/FormField.jsx";
import Icon from "../../../components/common/Icon.jsx";
import {
  createTemplateSectionFormValues,
  updateTemplateSectionFormValue,
  validateTemplateSectionValues,
} from "./templateSectionUtils.js";

function TemplateSectionEditor({
  onCancel,
  onSubmit,
  section,
  submitLabel = "Save Section",
  title = "Section Details",
}) {
  const formId = useId();
  const [values, setValues] = useState(() =>
    createTemplateSectionFormValues(section),
  );
  const [errors, setErrors] = useState({});
  const titleInputId = `${formId}-title`;
  const subtitleInputId = `${formId}-subtitle`;
  const instructionsInputId = `${formId}-instructions`;
  const targetMarksInputId = `${formId}-target-marks`;

  const handleFieldChange = useCallback((fieldName, value) => {
    setValues((currentValues) =>
      updateTemplateSectionFormValue(currentValues, fieldName, value),
    );
    setErrors((currentErrors) => ({
      ...currentErrors,
      [fieldName]: "",
    }));
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const validation = validateTemplateSectionValues(values, section?.id);

      setErrors(validation.errors);

      if (!validation.isValid) {
        return;
      }

      onSubmit(validation.section);
    },
    [onSubmit, section?.id, values],
  );

  return (
    <form
      className="template-section-editor"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="template-section-editor__header">
        <h3>{title}</h3>
      </div>

      <div className="template-section-editor__grid">
        <FormField
          error={errors.title}
          htmlFor={titleInputId}
          label="Title"
          required
        >
          <input
            aria-describedby={
              errors.title ? `${titleInputId}-error` : undefined
            }
            aria-invalid={Boolean(errors.title)}
            className="input"
            id={titleInputId}
            onChange={(event) =>
              handleFieldChange("title", event.target.value)
            }
            type="text"
            value={values.title}
          />
        </FormField>

        <FormField htmlFor={subtitleInputId} label="Subtitle">
          <input
            className="input"
            id={subtitleInputId}
            onChange={(event) =>
              handleFieldChange("subtitle", event.target.value)
            }
            type="text"
            value={values.subtitle}
          />
        </FormField>

        <FormField
          error={errors.targetMarks}
          htmlFor={targetMarksInputId}
          label="Target Marks"
        >
          <input
            aria-describedby={
              errors.targetMarks ? `${targetMarksInputId}-error` : undefined
            }
            aria-invalid={Boolean(errors.targetMarks)}
            className="input"
            id={targetMarksInputId}
            inputMode="numeric"
            onChange={(event) =>
              handleFieldChange("targetMarks", event.target.value)
            }
            type="text"
            value={values.targetMarks}
          />
        </FormField>

        <FormField htmlFor={instructionsInputId} label="Instructions">
          <textarea
            className="input template-section-editor__textarea"
            id={instructionsInputId}
            onChange={(event) =>
              handleFieldChange("instructions", event.target.value)
            }
            value={values.instructions}
          />
        </FormField>
      </div>

      <div className="template-section-editor__actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          <Icon name="close" size={16} />
          Cancel
        </Button>
        <Button type="submit">
          <Icon name="save" size={16} />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default TemplateSectionEditor;
