import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";

function InviteAdminForm({
  disabled = false,
  errors,
  feedback,
  isSubmitting,
  onChange,
  onSubmit,
  values,
}) {
  return (
    <form className="invite-admin-form" noValidate onSubmit={onSubmit}>
      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <div className="invite-admin-form__grid">
        <FormField
          error={errors.name}
          htmlFor="invite-admin-name"
          label="Full Name"
          required
        >
          <input
            aria-describedby={
              errors.name ? "invite-admin-name-error" : undefined
            }
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="input"
            disabled={disabled || isSubmitting}
            id="invite-admin-name"
            name="name"
            onChange={onChange}
            placeholder="Avery Johnson"
            value={values.name}
          />
        </FormField>

        <FormField
          error={errors.email}
          htmlFor="invite-admin-email"
          label="Email"
          required
        >
          <input
            aria-describedby={
              errors.email ? "invite-admin-email-error" : undefined
            }
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className="input"
            disabled={disabled || isSubmitting}
            id="invite-admin-email"
            inputMode="email"
            name="email"
            onChange={onChange}
            placeholder="admin@school.edu"
            type="email"
            value={values.email}
          />
        </FormField>
      </div>

      <div className="invite-admin-form__actions">
        <Button disabled={disabled} isLoading={isSubmitting} type="submit">
          {isSubmitting ? "Creating invitation..." : "Create Invitation"}
        </Button>
      </div>
    </form>
  );
}

export default InviteAdminForm;
