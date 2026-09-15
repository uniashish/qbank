const AUTH_ERROR_MESSAGES = {
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/user-disabled":
    "This account has been disabled. Contact your school administrator.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests":
    "Too many login attempts. Please try again later.",
  "auth/network-request-failed":
    "Unable to connect. Check your internet connection and try again.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked":
    "Your browser blocked the Google sign-in popup. Please allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
  "auth/email-already-in-use":
    "An account already exists for this email. Sign in, then reopen the invitation link.",
  "auth/weak-password": "Password must be at least 6 characters.",
};

export function getAuthErrorMessage(error) {
  return (
    AUTH_ERROR_MESSAGES[error?.code] ||
    "Something went wrong while signing in. Please try again."
  );
}
