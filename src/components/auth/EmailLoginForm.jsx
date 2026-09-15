import { useState } from "react";

import Button from "../common/Button.jsx";
import FormField from "../common/FormField.jsx";
import PasswordInput from "./PasswordInput.jsx";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailLoginForm({
  activeAction,
  onPasswordReset,
  onSubmit,
  onValidationError,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({ email: "", password: "" });
  const isEmailLoading = activeAction === "email";
  const isResetLoading = activeAction === "reset";
  const isProcessing = activeAction !== "idle";

  const validateLogin = () => {
    const trimmedEmail = email.trim();
    const nextErrors = { email: "", password: "" };

    if (!trimmedEmail) {
      nextErrors.email = "Enter your email address.";
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    }

    return nextErrors;
  };

  const validateReset = () => {
    const trimmedEmail = email.trim();
    const nextErrors = { email: "", password: "" };

    if (!trimmedEmail) {
      nextErrors.email =
        "Enter your email address before requesting a password reset.";
    }

    if (trimmedEmail && !emailPattern.test(trimmedEmail)) {
      nextErrors.email =
        "Enter a valid email address before requesting a password reset.";
    }

    return nextErrors;
  };

  const hasErrors = (errors) => Boolean(errors.email || errors.password);

  const firstError = (errors) => errors.email || errors.password;

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setFieldErrors((current) => ({ ...current, email: "" }));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setFieldErrors((current) => ({ ...current, password: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateLogin();

    if (hasErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      onValidationError(firstError(nextErrors));
      return;
    }

    setFieldErrors({ email: "", password: "" });
    onSubmit({ email: email.trim(), password });
  };

  const handlePasswordReset = () => {
    const nextErrors = validateReset();

    if (hasErrors(nextErrors)) {
      setFieldErrors(nextErrors);
      onValidationError(firstError(nextErrors));
      return;
    }

    setFieldErrors({ email: "", password: "" });
    onPasswordReset(email.trim());
  };

  return (
    <form className="email-login-form" noValidate onSubmit={handleSubmit}>
      <FormField
        error={fieldErrors.email}
        htmlFor="email"
        label="Email address"
        required
      >
        <input
          aria-describedby={fieldErrors.email ? "email-error" : undefined}
          aria-invalid={Boolean(fieldErrors.email)}
          autoComplete="email"
          className="input"
          disabled={isProcessing}
          id="email"
          inputMode="email"
          name="email"
          onChange={handleEmailChange}
          placeholder="teacher@school.com"
          type="email"
          value={email}
        />
      </FormField>

      <div className="password-row">
        <FormField
          error={fieldErrors.password}
          htmlFor="password"
          label="Password"
          required
        >
          <PasswordInput
            ariaDescribedBy={fieldErrors.password ? "password-error" : undefined}
            ariaInvalid={Boolean(fieldErrors.password)}
            disabled={isProcessing}
            id="password"
            name="password"
            onChange={handlePasswordChange}
            placeholder="Enter your password"
            value={password}
          />
        </FormField>
        <button
          className="text-button password-row__reset"
          disabled={isProcessing}
          onClick={handlePasswordReset}
          type="button"
        >
          {isResetLoading ? "Sending..." : "Forgot password?"}
        </button>
      </div>

      <Button isLoading={isEmailLoading} type="submit">
        {isEmailLoading ? "Signing in..." : "Sign In"}
      </Button>
    </form>
  );
}

export default EmailLoginForm;
