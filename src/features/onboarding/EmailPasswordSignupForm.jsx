import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import PasswordInput from "../../components/auth/PasswordInput.jsx";

function EmailPasswordSignupForm({
  activeAction,
  disabled = false,
  errors,
  idPrefix,
  onChange,
  onSubmit,
  showName = true,
  submitLabel = "Create Account",
  submittingLabel = "Creating account...",
  values,
}) {
  const isSubmitting = activeAction === "email";
  const isProcessing = activeAction !== "idle" || disabled;

  return (
    <form className="onboarding-form" noValidate onSubmit={onSubmit}>
      {showName && (
        <FormField
          error={errors.name}
          htmlFor={`${idPrefix}-name`}
          label="Full name"
          required
        >
          <input
            aria-describedby={errors.name ? `${idPrefix}-name-error` : undefined}
            aria-invalid={Boolean(errors.name)}
            autoComplete="name"
            className="input"
            disabled={isProcessing}
            id={`${idPrefix}-name`}
            name="name"
            onChange={onChange}
            placeholder="Your name"
            type="text"
            value={values.name}
          />
        </FormField>
      )}

      <FormField
        error={errors.email}
        htmlFor={`${idPrefix}-email`}
        label="Email address"
        required
      >
        <input
          aria-describedby={errors.email ? `${idPrefix}-email-error` : undefined}
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className="input"
          disabled={isProcessing}
          id={`${idPrefix}-email`}
          inputMode="email"
          name="email"
          onChange={onChange}
          placeholder="you@school.edu"
          type="email"
          value={values.email}
        />
      </FormField>

      <FormField
        error={errors.password}
        htmlFor={`${idPrefix}-password`}
        label="Password"
        required
      >
        <PasswordInput
          ariaDescribedBy={
            errors.password ? `${idPrefix}-password-error` : undefined
          }
          ariaInvalid={Boolean(errors.password)}
          autoComplete="new-password"
          disabled={isProcessing}
          id={`${idPrefix}-password`}
          name="password"
          onChange={onChange}
          placeholder="Create a password"
          value={values.password}
        />
      </FormField>

      <FormField
        error={errors.confirmPassword}
        htmlFor={`${idPrefix}-confirm-password`}
        label="Confirm password"
        required
      >
        <PasswordInput
          ariaDescribedBy={
            errors.confirmPassword
              ? `${idPrefix}-confirm-password-error`
              : undefined
          }
          ariaInvalid={Boolean(errors.confirmPassword)}
          autoComplete="new-password"
          disabled={isProcessing}
          id={`${idPrefix}-confirm-password`}
          name="confirmPassword"
          onChange={onChange}
          placeholder="Confirm your password"
          value={values.confirmPassword}
        />
      </FormField>

      <Button isLoading={isSubmitting} type="submit">
        {isSubmitting ? submittingLabel : submitLabel}
      </Button>
    </form>
  );
}

export default EmailPasswordSignupForm;
