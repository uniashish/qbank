import { useState } from "react";

function PasswordInput({
  ariaDescribedBy,
  ariaInvalid,
  autoComplete = "current-password",
  disabled = false,
  id,
  name,
  onChange,
  placeholder,
  value,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const inputType = isVisible ? "text" : "password";

  return (
    <div className="password-input">
      <input
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        autoComplete={autoComplete}
        className="input password-input__control"
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        type={inputType}
        value={value}
      />
      <button
        aria-label={isVisible ? "Hide password" : "Show password"}
        className="password-input__toggle"
        disabled={disabled}
        onClick={() => setIsVisible((current) => !current)}
        type="button"
      >
        {isVisible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="M2.5 12s3.5-6.5 9.5-6.5 9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="20"
      viewBox="0 0 24 24"
      width="20"
    >
      <path
        d="m3 3 18 18M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58M9.88 5.62A9.46 9.46 0 0 1 12 5.38c6 0 9.5 6.62 9.5 6.62a18.6 18.6 0 0 1-2.37 3.21M6.61 6.92C3.94 8.76 2.5 12 2.5 12s3.5 6.62 9.5 6.62a9.62 9.62 0 0 0 4.05-.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export default PasswordInput;
