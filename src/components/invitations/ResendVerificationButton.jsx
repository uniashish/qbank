import Button from "../common/Button.jsx";

function ResendVerificationButton({
  cooldownSeconds = 0,
  disabled = false,
  isResending = false,
  onResend,
}) {
  const isCoolingDown = cooldownSeconds > 0;
  const buttonLabel = isCoolingDown
    ? `Resend in ${cooldownSeconds}s`
    : "Resend verification email";

  return (
    <Button
      disabled={disabled || isCoolingDown}
      isLoading={isResending}
      onClick={onResend}
      type="button"
      variant="secondary"
    >
      {isResending ? "Sending..." : buttonLabel}
    </Button>
  );
}

export default ResendVerificationButton;
