import { getAccountAccessRedirect } from "./getAccountAccessRedirect.js";
import { getDefaultRouteForRole } from "./getDefaultRouteForRole.js";

export function getRouteForUserProfile(userProfile) {
  const accountRedirect = getAccountAccessRedirect(userProfile);

  if (accountRedirect) {
    return accountRedirect;
  }

  return getDefaultRouteForRole(userProfile.role);
}
