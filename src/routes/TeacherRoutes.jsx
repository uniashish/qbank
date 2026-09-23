import { Route } from "react-router-dom";

import ActiveTeacherRoute from "../components/auth/ActiveTeacherRoute.jsx";
import ProtectedRoute from "../components/auth/ProtectedRoute.jsx";
import RoleRoute from "../components/auth/RoleRoute.jsx";
import { USER_ROLES } from "../constants/roles.js";
import TeacherLayout from "../layouts/TeacherLayout.jsx";
import TeacherDashboardPage from "../pages/teacher/TeacherDashboardPage.jsx";
import TeacherQuestionBankPage from "../pages/teacher/TeacherQuestionBankPage.jsx";
import CreateQuestionPaperPage from "../features/question-paper/pages/CreateQuestionPaperPage.jsx";
import QuestionPaperDesignerPage from "../features/question-paper/pages/QuestionPaperDesignerPage.jsx";
import QuestionPapersPage from "../features/question-paper/pages/QuestionPapersPage.jsx";
import CreateQuestionPaperTemplatePage from "../features/question-paper-template/pages/CreateQuestionPaperTemplatePage.jsx";
import QuestionPaperTemplatesPage from "../features/question-paper-template/pages/QuestionPaperTemplatesPage.jsx";
import TemplateDesignerPage from "../features/question-paper-template/pages/TemplateDesignerPage.jsx";
import ShareQuestionsPage from "../features/question-sharing/ShareQuestionsPage.jsx";

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
      <Route
        path="question-bank"
        element={
          <ActiveTeacherRoute>
            <TeacherQuestionBankPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers"
        element={
          <ActiveTeacherRoute>
            <QuestionPapersPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/new"
        element={
          <ActiveTeacherRoute>
            <CreateQuestionPaperPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/templates"
        element={
          <ActiveTeacherRoute>
            <QuestionPaperTemplatesPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/templates/new"
        element={
          <ActiveTeacherRoute>
            <CreateQuestionPaperTemplatePage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/templates/new/design"
        element={
          <ActiveTeacherRoute>
            <TemplateDesignerPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/templates/:templateId/edit"
        element={
          <ActiveTeacherRoute>
            <TemplateDesignerPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/new/design"
        element={
          <ActiveTeacherRoute>
            <QuestionPaperDesignerPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="exam-papers/:paperId/edit"
        element={
          <ActiveTeacherRoute>
            <QuestionPaperDesignerPage />
          </ActiveTeacherRoute>
        }
      />
      <Route
        path="share-questions"
        element={
          <ActiveTeacherRoute>
            <ShareQuestionsPage />
          </ActiveTeacherRoute>
        }
      />
    </Route>
  );
}
