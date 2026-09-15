import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";

function InviteTeacherForm({
  disabled = false,
  errors,
  feedback,
  isSubmitting,
  onChange,
  onSubmit,
  values,
}) {
  return (
    <form className="invite-teacher-form" noValidate onSubmit={onSubmit}>
      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <div className="invite-teacher-form__grid">
        <FormField
          error={errors.name}
          htmlFor="invite-teacher-name"
          label="Full Name"
          required
        >
          <input
            aria-describedby={
              errors.name ? "invite-teacher-name-error" : undefined
            }
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="input"
            disabled={disabled || isSubmitting}
            id="invite-teacher-name"
            name="name"
            onChange={onChange}
            placeholder="Maya Chen"
            value={values.name}
          />
        </FormField>

        <FormField
          error={errors.email}
          htmlFor="invite-teacher-email"
          label="Email"
          required
        >
          <input
            aria-describedby={
              errors.email ? "invite-teacher-email-error" : undefined
            }
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="input"
            disabled={disabled || isSubmitting}
            id="invite-teacher-email"
            inputMode="email"
            name="email"
            onChange={onChange}
            placeholder="teacher@school.edu"
            type="email"
            value={values.email}
          />
        </FormField>
      </div>

      <div className="invite-teacher-form__actions">
        <Button disabled={disabled} isLoading={isSubmitting} type="submit">
          {isSubmitting ? "Creating invitation..." : "Create Invitation"}
        </Button>
      </div>
    </form>
  );
}

export default InviteTeacherForm;
