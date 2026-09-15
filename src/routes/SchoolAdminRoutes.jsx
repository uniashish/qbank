import { Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import { USER_ROLES } from "../constants/roles.js";
import SchoolAdminLayout from "../layouts/SchoolAdminLayout.jsx";
import ClassesPage from "../pages/school-admin/ClassesPage.jsx";
import ClassSubjectMappingPage from "../pages/school-admin/ClassSubjectMappingPage.jsx";
import InviteTeacherPage from "../pages/school-admin/InviteTeacherPage.jsx";
import SchoolAdminDashboard from "../pages/school-admin/SchoolAdminDashboard.jsx";
import SchoolAdminPlaceholderPage from "../pages/school-admin/SchoolAdminPlaceholderPage.jsx";
import SubjectsPage from "../pages/school-admin/SubjectsPage.jsx";
import TeacherAssignmentsPage from "../pages/school-admin/TeacherAssignmentsPage.jsx";
import TeachersPage from "../pages/school-admin/TeachersPage.jsx";

export function getSchoolAdminRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={[USER_ROLES.SCHOOL_ADMIN]}>
            <SchoolAdminLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
      path="/school-admin"
    >
      <Route index element={<SchoolAdminDashboard />} />
      <Route path="teachers" element={<TeachersPage />} />
      <Route path="teachers/invite" element={<InviteTeacherPage />} />
      <Route path="classes" element={<ClassesPage />} />
      <Route path="subjects" element={<SubjectsPage />} />
      <Route path="class-subjects" element={<ClassSubjectMappingPage />} />
      <Route path="teacher-assignments" element={<TeacherAssignmentsPage />} />
      <Route
        path="question-bank"
        element={
          <SchoolAdminPlaceholderPage
            description="Question bank tools will be implemented in a later phase."
            title="Question Bank"
          />
        }
      />
      <Route
        path="exam-papers"
        element={
          <SchoolAdminPlaceholderPage
            description="Exam paper generation will be implemented in a later phase."
            title="Exam Papers"
          />
        }
      />
      <Route
        path="settings"
        element={
          <SchoolAdminPlaceholderPage
            description="School settings will be implemented in a later phase."
            title="Settings"
          />
        }
      />
    </Route>
  );
}
