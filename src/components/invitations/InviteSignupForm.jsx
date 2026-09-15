import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import GoogleSignInButton from "../auth/GoogleSignInButton.jsx";
import PasswordInput from "../auth/PasswordInput.jsx";

function InviteSignupForm({
  activeAction,
  errors,
  invitationEmail,
  onChange,
  onGoogleSignup,
  onSubmit,
  values,
}) {
  const isProcessing = activeAction !== "idle";

  return (
    <div className="invite-signup-form">
      <form noValidate onSubmit={onSubmit}>
        <FormField
          helperText="This must match the email on the invitation."
          htmlFor="invite-signup-email"
          label="Email"
        >
          <input
            className="input"
            id="invite-signup-email"
            readOnly
            type="email"
            value={invitationEmail}
          />
        </FormField>

        <FormField
          error={errors.password}
          htmlFor="invite-signup-password"
          label="Password"
          required
        >
          <PasswordInput
            ariaDescribedBy={
              errors.password ? "invite-signup-password-error" : undefined
            }
            ariaInvalid={Boolean(errors.password)}
            disabled={isProcessing}
            id="invite-signup-password"
            name="password"
            onChange={onChange}
            placeholder="Create a password"
            value={values.password}
          />
        </FormField>

        <FormField
          error={errors.confirmPassword}
          htmlFor="invite-signup-confirm-password"
          label="Confirm Password"
          required
        >
          <PasswordInput
            ariaDescribedBy={
              errors.confirmPassword
                ? "invite-signup-confirm-password-error"
                : undefined
            }
            ariaInvalid={Boolean(errors.confirmPassword)}
            disabled={isProcessing}
            id="invite-signup-confirm-password"
            name="confirmPassword"
            onChange={onChange}
            placeholder="Confirm your password"
            value={values.confirmPassword}
          />
        </FormField>

        <Button isLoading={activeAction === "email"} type="submit">
          {activeAction === "email" ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <GoogleSignInButton
        disabled={isProcessing}
        isLoading={activeAction === "google"}
        onClick={onGoogleSignup}
      />
    </div>
  );
}

export default InviteSignupForm;
