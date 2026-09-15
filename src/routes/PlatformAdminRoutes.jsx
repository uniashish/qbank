import { Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import { USER_ROLES } from "../constants/roles.js";
import PlatformAdminLayout from "../layouts/PlatformAdminLayout.jsx";
import AdminOverviewPage from "../pages/admin/AdminOverviewPage.jsx";
import AdminPlaceholderPage from "../pages/admin/AdminPlaceholderPage.jsx";
import AssignSchoolAdminPage from "../pages/admin/AssignSchoolAdminPage.jsx";
import CreateSchoolPage from "../pages/admin/CreateSchoolPage.jsx";
import SchoolDetailsPage from "../pages/admin/SchoolDetailsPage.jsx";
import SchoolsPage from "../pages/admin/SchoolsPage.jsx";

export function getPlatformAdminRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={[USER_ROLES.PLATFORM_ADMIN]}>
            <PlatformAdminLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
      path="/admin"
    >
      <Route index element={<AdminOverviewPage />} />
      <Route path="schools" element={<SchoolsPage />} />
      <Route path="schools/new" element={<CreateSchoolPage />} />
      <Route path="schools/:schoolId" element={<SchoolDetailsPage />} />
      <Route
        path="schools/:schoolId/admin"
        element={<AssignSchoolAdminPage />}
      />
      <Route
        path="administrators"
        element={
          <AdminPlaceholderPage
            description="Invite and review school administrator accounts."
            title="Administrators"
          />
        }
      />
      <Route
        path="users"
        element={
          <AdminPlaceholderPage
            description="Review platform users across schools and roles."
            title="Users"
          />
        }
      />
      <Route
        path="settings"
        element={
          <AdminPlaceholderPage
            description="Configure platform-level settings and access."
            title="Settings"
          />
        }
      />
    </Route>
  );
}
