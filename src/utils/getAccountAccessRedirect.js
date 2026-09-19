import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import { USER_ROLES } from "../constants/roles.js";

export function getAccountAccessRedirect(userProfile) {
  if (!userProfile) {
    return "/account-not-provisioned";
  }

  if (userProfile.status === ACCOUNT_STATUSES.DISABLED) {
    return "/account-disabled";
  }

  if (
    userProfile.role === USER_ROLES.TEACHER &&
    userProfile.status === ACCOUNT_STATUSES.PENDING_APPROVAL
  ) {
    return null;
  }

  if (userProfile.status !== ACCOUNT_STATUSES.ACTIVE) {
    return "/unauthorized";
  }

  return null;
}
