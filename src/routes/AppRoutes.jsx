import { matchPath, Navigate, Route, Routes, useLocation } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import FullPageLoader from "../components/common/FullPageLoader.jsx";
import { USER_ROLES } from "../constants/roles.js";
import { useAuth } from "../hooks/useAuth.js";
import LoginPage from "../pages/LoginPage.jsx";
import RegisterPlaceholderPage from "../pages/RegisterPlaceholderPage.jsx";
import RolePlaceholderPage from "../pages/RolePlaceholderPage.jsx";
import AccountDisabledPage from "../pages/auth/AccountDisabledPage.jsx";
import InvitationSignupPage from "../pages/auth/InvitationSignupPage.jsx";
import AccountNotProvisionedPage from "../pages/auth/AccountNotProvisionedPage.jsx";
import UnauthorizedPage from "../pages/auth/UnauthorizedPage.jsx";
import { getPlatformAdminRoutes } from "./PlatformAdminRoutes.jsx";
import { getSchoolAdminRoutes } from "./SchoolAdminRoutes.jsx";
import { getTeacherRoutes } from "./TeacherRoutes.jsx";
import { getAccountAccessRedirect } from "../utils/getAccountAccessRedirect.js";
import { getDefaultRouteForRole } from "../utils/getDefaultRouteForRole.js";

const INVITATION_ROUTE_PATTERN = "/invite/:token";

function isInvitationRoute(pathname) {
  return Boolean(
    matchPath({ end: true, path: INVITATION_ROUTE_PATTERN }, pathname),
  );
}

function AccountAccessRouteBoundary({ children }) {
  const location = useLocation();
  const { isAuthenticated, loading, userProfile } = useAuth();

  if (!loading && isAuthenticated && !isInvitationRoute(location.pathname)) {
    const accountRedirect = getAccountAccessRedirect(userProfile);

    if (accountRedirect && location.pathname !== accountRedirect) {
      return <Navigate replace state={{ from: location }} to={accountRedirect} />;
    }
  }

  return children;
}

function DefaultRouteRedirect() {
  const { isAuthenticated, loading, role, userProfile } = useAuth();

  if (loading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  const accountRedirect = getAccountAccessRedirect(userProfile);

  if (accountRedirect) {
    return <Navigate replace to={accountRedirect} />;
  }

  return <Navigate replace to={getDefaultRouteForRole(role)} />;
}

function AppRoutes() {
  return (
    <AccountAccessRouteBoundary>
      <Routes>
        <Route path="/" element={<DefaultRouteRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path={INVITATION_ROUTE_PATTERN} element={<InvitationSignupPage />} />
        <Route path="/register" element={<RegisterPlaceholderPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route
          path="/account-not-provisioned"
          element={<AccountNotProvisionedPage />}
        />
        <Route path="/account-disabled" element={<AccountDisabledPage />} />

        {getPlatformAdminRoutes()}
        {getSchoolAdminRoutes()}
        {getTeacherRoutes()}

        <Route path="/dashboard" element={<Navigate replace to="/teacher" />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[USER_ROLES.STUDENT]}>
                <RolePlaceholderPage
                  description="Student practice and exam workflows will be added in a later phase."
                  title="Student Dashboard"
                />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AccountAccessRouteBoundary>
  );
}

export default AppRoutes;
