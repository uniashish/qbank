import { USER_ROLES } from "../constants/roles.js";

const ROLE_LABELS = {
  [USER_ROLES.PLATFORM_ADMIN]: "Platform Admin",
  [USER_ROLES.SCHOOL_ADMIN]: "School Admin",
  [USER_ROLES.TEACHER]: "Teacher",
  [USER_ROLES.STUDENT]: "Student",
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] ?? "Unknown Role";
}
