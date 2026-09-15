import { USER_ROLES } from "../constants/roles.js";

const DEFAULT_ROUTES_BY_ROLE = {
  [USER_ROLES.PLATFORM_ADMIN]: "/admin",
  [USER_ROLES.SCHOOL_ADMIN]: "/school-admin",
  [USER_ROLES.TEACHER]: "/teacher",
  [USER_ROLES.STUDENT]: "/student",
};

export function getDefaultRouteForRole(role) {
  return DEFAULT_ROUTES_BY_ROLE[role] ?? "/unauthorized";
}
