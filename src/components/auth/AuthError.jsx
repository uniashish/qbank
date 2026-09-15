function AuthError({ children }) {
  if (!children) {
    return null;
  }

  return (
    <div className="auth-error" role="alert" aria-live="polite">
      <svg
        aria-hidden="true"
        className="auth-error__icon"
        fill="none"
        height="18"
        viewBox="0 0 24 24"
        width="18"
      >
        <path
          d="M12 8v5m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
        />
      </svg>
      <p>{children}</p>
    </div>
  );
}

export default AuthError;
