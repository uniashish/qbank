import {
  ACADEMIC_STATUSES,
  ACADEMIC_STATUS_LABELS,
} from "../../constants/academicStatus.js";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";

function SubjectForm({
  disabled = false,
  errors,
  isEditing = false,
  isSubmitting = false,
  onCancel,
  onChange,
  onSubmit,
  values,
}) {
  return (
    <form className="academic-form" noValidate onSubmit={onSubmit}>
      <div className="academic-form__grid">
        <FormField
          error={errors.name}
          htmlFor="subject-name"
          label="Subject Name"
          required
        >
          <input
            aria-describedby={errors.name ? "subject-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className="input"
            disabled={disabled || isSubmitting}
            id="subject-name"
            name="name"
            onChange={onChange}
            placeholder="Mathematics"
            value={values.name}
          />
        </FormField>

        <FormField
          error={errors.code}
          htmlFor="subject-code"
          label="Code"
          required
        >
          <input
            aria-describedby={errors.code ? "subject-code-error" : undefined}
            aria-invalid={Boolean(errors.code)}
            className="input"
            disabled={disabled || isSubmitting}
            id="subject-code"
            name="code"
            onChange={onChange}
            placeholder="MATH"
            value={values.code}
          />
        </FormField>

        <FormField htmlFor="subject-status" label="Status">
          <select
            className="input academic-form__select"
            disabled={disabled || isSubmitting}
            id="subject-status"
            name="status"
            onChange={onChange}
            value={values.status}
          >
            <option value={ACADEMIC_STATUSES.ACTIVE}>
              {ACADEMIC_STATUS_LABELS[ACADEMIC_STATUSES.ACTIVE]}
            </option>
            <option value={ACADEMIC_STATUSES.INACTIVE}>
              {ACADEMIC_STATUS_LABELS[ACADEMIC_STATUSES.INACTIVE]}
            </option>
          </select>
        </FormField>
      </div>

      <div className="academic-form__actions">
        {isEditing && (
          <button
            className="link-button link-button--secondary"
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
        )}
        <Button disabled={disabled} isLoading={isSubmitting} type="submit">
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Save Subject"
              : "Create Subject"}
        </Button>
      </div>
    </form>
  );
}

export default SubjectForm;
