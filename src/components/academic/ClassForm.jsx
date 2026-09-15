import {
  ACADEMIC_STATUSES,
  ACADEMIC_STATUS_LABELS,
} from "../../constants/academicStatus.js";
import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";

function ClassForm({
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
          htmlFor="class-name"
          label="Class Name"
          required
        >
          <input
            aria-describedby={errors.name ? "class-name-error" : undefined}
            aria-invalid={Boolean(errors.name)}
            className="input"
            disabled={disabled || isSubmitting}
            id="class-name"
            name="name"
            onChange={onChange}
            placeholder="Class 7"
            value={values.name}
          />
        </FormField>

        <FormField error={errors.code} htmlFor="class-code" label="Code" required>
          <input
            aria-describedby={errors.code ? "class-code-error" : undefined}
            aria-invalid={Boolean(errors.code)}
            className="input"
            disabled={disabled || isSubmitting}
            id="class-code"
            name="code"
            onChange={onChange}
            placeholder="G7"
            value={values.code}
          />
        </FormField>

        <FormField htmlFor="class-status" label="Status">
          <select
            className="input academic-form__select"
            disabled={disabled || isSubmitting}
            id="class-status"
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
              ? "Save Class"
              : "Create Class"}
        </Button>
      </div>
    </form>
  );
}

export default ClassForm;
