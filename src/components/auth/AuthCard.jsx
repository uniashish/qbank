import { Link } from "react-router-dom";

import AuthDivider from "./AuthDivider.jsx";
import AuthError from "./AuthError.jsx";
import AuthHeader from "./AuthHeader.jsx";
import EmailLoginForm from "./EmailLoginForm.jsx";
import GoogleSignInButton from "./GoogleSignInButton.jsx";

function AuthCard({
  activeAction,
  feedback,
  onEmailLogin,
  onGoogleLogin,
  onPasswordReset,
  onValidationError,
}) {
  const isGoogleLoading = activeAction === "google";
  const isProcessing = activeAction !== "idle";

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <AuthHeader />

      {feedback.type === "error" && <AuthError>{feedback.message}</AuthError>}
      {feedback.type === "success" && (
        <div className="auth-success" role="status" aria-live="polite">
          <svg
            aria-hidden="true"
            fill="none"
            height="18"
            viewBox="0 0 24 24"
            width="18"
          >
            <path
              d="m5 12 4 4L19 6"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <p>{feedback.message}</p>
        </div>
      )}

      <EmailLoginForm
        activeAction={activeAction}
        onPasswordReset={onPasswordReset}
        onSubmit={onEmailLogin}
        onValidationError={onValidationError}
      />

      <AuthDivider />

      <GoogleSignInButton
        disabled={isProcessing}
        isLoading={isGoogleLoading}
        onClick={onGoogleLogin}
      />

      <p className="auth-card__register">
        Don&apos;t have an account? <Link to="/register">Create account</Link>
      </p>
    </section>
  );
}

export default AuthCard;
