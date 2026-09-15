import Button from "../common/Button.jsx";

function GoogleSignInButton({ disabled = false, isLoading = false, onClick }) {
  return (
    <Button
      className="google-button"
      disabled={disabled}
      isLoading={isLoading}
      onClick={onClick}
      variant="secondary"
    >
      {!isLoading && <GoogleMark />}
      <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg
      aria-hidden="true"
      className="google-button__mark"
      height="20"
      viewBox="0 0 20 20"
      width="20"
    >
      <path
        d="M19.6 10.23c0-.71-.06-1.23-.19-1.77H10v3.22h5.52c-.11.8-.71 2-2.05 2.81l-.02.11 2.97 2.24.21.02c1.94-1.75 2.97-4.32 2.97-6.63Z"
        fill="#4285F4"
      />
      <path
        d="M10 19.75c2.77 0 5.09-.89 6.79-2.43l-3.23-2.43c-.86.59-2.02.99-3.56.99a6.17 6.17 0 0 1-5.84-4.17l-.12.01-3.09 2.33-.04.11A10 10 0 0 0 10 19.75Z"
        fill="#34A853"
      />
      <path
        d="M4.16 11.71A6.05 6.05 0 0 1 3.82 9.75c0-.68.12-1.34.33-1.96l-.01-.13L1.01 5.29l-.1.05A9.6 9.6 0 0 0 0 9.75c0 1.59.39 3.08 1.08 4.41l3.08-2.45Z"
        fill="#FBBC05"
      />
      <path
        d="M10 3.62c1.93 0 3.23.81 3.97 1.49l2.9-2.76C15.09.73 12.77-.25 10-.25A10 10 0 0 0 .91 5.34l3.24 2.45A6.2 6.2 0 0 1 10 3.62Z"
        fill="#EB4335"
      />
    </svg>
  );
}

export default GoogleSignInButton;
