import { ACCOUNT_STATUSES } from "../constants/userStatus.js";

export function getAccountAccessRedirect(userProfile) {
  if (!userProfile) {
    return "/account-not-provisioned";
  }

  if (userProfile.status === ACCOUNT_STATUSES.DISABLED) {
    return "/account-disabled";
  }

  if (userProfile.status !== ACCOUNT_STATUSES.ACTIVE) {
    return "/unauthorized";
  }

  return null;
}
