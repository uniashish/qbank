import { Resend } from "resend";

const DEFAULT_INVITATION_EMAIL_FROM = "QBank <onboarding@resend.dev>";

let resendClient = null;

function getTrimmedEnv(name) {
  return process.env[name]?.trim() ?? "";
}

export function getResendClient() {
  const apiKey = getTrimmedEnv("RESEND_API_KEY");

  if (!apiKey) {
    throw new Error("Resend API key is not configured.");
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getInvitationEmailFrom() {
  return getTrimmedEnv("INVITATION_EMAIL_FROM") || DEFAULT_INVITATION_EMAIL_FROM;
}

export function getAppBaseUrl() {
  const appBaseUrl = getTrimmedEnv("APP_BASE_URL");

  if (!appBaseUrl) {
    throw new Error("APP_BASE_URL is not configured.");
  }

  const parsedUrl = new URL(appBaseUrl);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("APP_BASE_URL must be an HTTP or HTTPS URL.");
  }

  return appBaseUrl.replace(/\/+$/, "");
}

export function buildInvitationUrl(token) {
  return `${getAppBaseUrl()}/invite/${encodeURIComponent(token)}`;
}
