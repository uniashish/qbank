import AppShell from "../components/layout/AppShell.jsx";

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
  return <AppShell navItems={teacherNavItems} />;
}

export default TeacherLayout;
