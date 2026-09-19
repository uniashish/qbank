import { getAuthErrorMessage } from "../../utils/authErrors.js";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getOnboardingErrorMessage(error, fallbackMessage) {
  if (typeof error?.code === "string" && error.code.startsWith("auth/")) {
    if (error.code === "auth/email-already-in-use") {
      return "An account already exists for this email. Sign in with that account instead.";
    }

    return getAuthErrorMessage(error);
  }

  if (error?.code === "ACCOUNT_ALREADY_PROVISIONED") {
    return "This account already has a QBank profile. Sign in instead.";
  }

  if (error?.code === "EMAIL_NOT_VERIFIED") {
    return "Verify your email address before continuing.";
  }

  if (error?.code === "SCHOOL_NOT_ACCEPTING_JOIN_REQUESTS") {
    return "This school is not accepting join requests.";
  }

  if (error?.code === "DUPLICATE_JOIN_REQUEST") {
    return "A pending join request already exists for this school.";
  }

  if (error?.code === "USER_ALREADY_LINKED") {
    return "This account already belongs to a school or has a pending request.";
  }

  return error?.message || fallbackMessage;
}

export const initialSignupValues = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

export const initialSignupErrors = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

export function validateSignupCredentials(values) {
  const normalizedValues = {
    email: values.email.trim(),
    name: values.name.trim(),
    password: values.password,
    confirmPassword: values.confirmPassword,
  };
  const errors = { ...initialSignupErrors };

  if (!normalizedValues.name) {
    errors.name = "Enter your name.";
  }

  if (!normalizedValues.email) {
    errors.email = "Enter your email address.";
  } else if (!emailPattern.test(normalizedValues.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!normalizedValues.password) {
    errors.password = "Create a password.";
  } else if (normalizedValues.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!normalizedValues.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (normalizedValues.confirmPassword !== normalizedValues.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
    values: normalizedValues,
  };
}

export function readPendingSignup(key) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem(key)) ?? null;
  } catch {
    return null;
  }
}

export function savePendingSignup(key, values) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(values));
}

export function clearPendingSignup(key) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}
