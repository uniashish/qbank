import { Route } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import { USER_ROLES } from "../constants/roles.js";
import TeacherLayout from "../layouts/TeacherLayout.jsx";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage.jsx";
import TeacherPlaceholderPage from "../pages/teacher/TeacherPlaceholderPage.jsx";
import TeacherQuestionBankPage from "../pages/teacher/TeacherQuestionBankPage.jsx";

export function getTeacherRoutes() {
  return (
    <Route
      element={
        <ProtectedRoute>
          <RoleRoute allowedRoles={[USER_ROLES.TEACHER]}>
            <TeacherLayout />
          </RoleRoute>
        </ProtectedRoute>
      }
      path="/teacher"
    >
      <Route index element={<TeacherDashboardPage />} />
      <Route path="question-bank" element={<TeacherQuestionBankPage />} />
      <Route
        path="exam-papers"
        element={
          <TeacherPlaceholderPage
            description="Exam paper workflows will be implemented in a later phase."
            title="Exam Papers"
          />
        }
      />
    </Route>
  );
}
