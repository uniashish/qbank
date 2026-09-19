import AppShell from "../components/layout/AppShell.jsx";
import { ACCOUNT_STATUSES } from "../constants/userStatus.js";
import { useAuth } from "../hooks/useAuth.js";

const teacherNavItems = [
  {
    end: true,
    icon: "dashboard",
    label: "Overview",
    path: "/teacher",
  },
  {
    icon: "book",
    label: "Question Bank",
    path: "/teacher/question-bank",
  },
  {
    icon: "fileText",
    label: "Exam Papers",
    path: "/teacher/exam-papers",
  },
  {
    icon: "link",
    label: "Share Questions",
    path: "/teacher/share-questions",
  },
];

function TeacherLayout() {
  const { userProfile } = useAuth();
  const navItems =
    userProfile?.status === ACCOUNT_STATUSES.PENDING_APPROVAL
      ? teacherNavItems.filter((item) => item.end)
      : teacherNavItems;

  return <AppShell navItems={navItems} />;
}

export default TeacherLayout;
