import Button from "../common/Button.jsx";
import ResendVerificationButton from "./ResendVerificationButton.jsx";

function EmailVerificationNotice({
  cooldownSeconds = 0,
  email,
  hasSentVerificationEmail = false,
  isChecking = false,
  isProcessing = false,
  isResending = false,
  onCheckVerification,
  onResendVerification,
  onSignOut,
}) {
  return (
    <div className="email-verification-notice" aria-live="polite">
      <div>
        <p className="email-verification-notice__eyebrow">
          {hasSentVerificationEmail
            ? "Verification email sent"
            : "Email verification required"}
        </p>
        <h2>Verify your email</h2>
        {hasSentVerificationEmail ? (
          <p>
            We sent a verification link to <strong>{email}</strong>. Open the
            email and verify your address before continuing.
          </p>
        ) : (
          <p>
            Verify <strong>{email}</strong> before accepting this invitation.
            You can resend the verification email if you need a fresh link.
          </p>
        )}
      </div>

      <div className="email-verification-notice__actions">
        <Button
          disabled={isProcessing}
          isLoading={isChecking}
          onClick={onCheckVerification}
          type="button"
        >
          {isChecking ? "Checking..." : "I've verified my email"}
        </Button>
        <ResendVerificationButton
          cooldownSeconds={cooldownSeconds}
          disabled={isProcessing}
          isResending={isResending}
          onResend={onResendVerification}
        />
        <button
          className="link-button link-button--secondary"
          disabled={isProcessing}
          onClick={onSignOut}
          type="button"
        >
          Use another account
        </button>
      </div>
    </div>
  );
}

export default EmailVerificationNotice;
