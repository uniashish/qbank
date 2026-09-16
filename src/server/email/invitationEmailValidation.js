import { INVITATION_STATUSES } from "../../constants/invitationStatus.js";
import { USER_ROLES } from "../../constants/roles.js";
import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";

const ALLOWED_REQUEST_KEYS = new Set(["invitationId", "schoolId"]);
const SUPPORTED_INVITATION_ROLES = new Set([
  USER_ROLES.SCHOOL_ADMIN,
  USER_ROLES.TEACHER,
]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class InvitationEmailError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = "InvitationEmailError";
    this.statusCode = statusCode;
  }
}

function getRequiredString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new InvitationEmailError(400, `${fieldName} is required.`);
  }

  return value.trim();
}

function toDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export function validateInvitationEmailRequest(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new InvitationEmailError(400, "Request body must be a JSON object.");
  }

  const unknownKeys = Object.keys(payload).filter(
    (key) => !ALLOWED_REQUEST_KEYS.has(key),
  );

  if (unknownKeys.length > 0) {
    throw new InvitationEmailError(400, "Request contains unsupported fields.");
  }

  return {
    invitationId: getRequiredString(payload.invitationId, "invitationId"),
    schoolId: getRequiredString(payload.schoolId, "schoolId"),
  };
}

export function validateInvitationForEmail({
  invitation,
  invitationId,
  school,
  schoolId,
}) {
  if (!invitation) {
    throw new InvitationEmailError(404, "Invitation not found.");
  }

  if (invitation.schoolId !== schoolId) {
    throw new InvitationEmailError(403, "Invitation does not belong to this school.");
  }

  if (invitation.status !== INVITATION_STATUSES.PENDING) {
    throw new InvitationEmailError(
      409,
      "Only pending invitations can be emailed.",
    );
  }

  if (!SUPPORTED_INVITATION_ROLES.has(invitation.role)) {
    throw new InvitationEmailError(400, "Invitation role is not supported.");
  }

  const email = normalizeEmail(invitation.email);

  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new InvitationEmailError(400, "Invitation email is not valid.");
  }

  if (typeof invitation.token !== "string" || !invitation.token.trim()) {
    throw new InvitationEmailError(400, "Invitation token is not valid.");
  }

  if (invitation.token !== invitationId) {
    throw new InvitationEmailError(400, "Invitation token does not match.");
  }

  const expiresAtDate = toDate(invitation.expiresAt);

  if (!expiresAtDate || expiresAtDate.getTime() <= Date.now()) {
    throw new InvitationEmailError(410, "Invitation has expired.");
  }

  if (!school) {
    throw new InvitationEmailError(404, "Invitation school not found.");
  }

  if (school.status && school.status !== "active") {
    throw new InvitationEmailError(409, "Invitation school is not active.");
  }

  return {
    ...invitation,
    email,
    expiresAtDate,
    token: invitation.token.trim(),
  };
}

export function validateInvitationEmailPermission({
  callerProfile,
  invitation,
}) {
  if (!callerProfile || callerProfile.status !== ACCOUNT_STATUSES.ACTIVE) {
    throw new InvitationEmailError(
      403,
      "You do not have permission to send this invitation.",
    );
  }

  if (callerProfile.role === USER_ROLES.PLATFORM_ADMIN) {
    if (invitation.role !== USER_ROLES.SCHOOL_ADMIN) {
      throw new InvitationEmailError(
        403,
        "Platform admins can email School Admin invitations only.",
      );
    }

    return;
  }

  if (callerProfile.role === USER_ROLES.SCHOOL_ADMIN) {
    if (
      invitation.role !== USER_ROLES.TEACHER ||
      callerProfile.schoolId !== invitation.schoolId
    ) {
      throw new InvitationEmailError(
        403,
        "You do not have permission to send this invitation.",
      );
    }

    return;
  }

  throw new InvitationEmailError(
    403,
    "You do not have permission to send this invitation.",
  );
}

export function getInvitationEmailErrorStatus(error) {
  return error instanceof InvitationEmailError ? error.statusCode : 500;
}

export function getInvitationEmailErrorMessage(error) {
  if (error instanceof InvitationEmailError) {
    return error.message;
  }

  return "Invitation email could not be sent.";
}
