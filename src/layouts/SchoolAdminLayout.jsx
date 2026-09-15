import AppShell from "../components/layout/AppShell.jsx";

const schoolAdminNavItems = [
  {
    end: true,
    icon: "dashboard",
    label: "Overview",
    path: "/school-admin",
  },
  {
    icon: "users",
    label: "Teachers",
    path: "/school-admin/teachers",
  },
  {
    key: "academic-setup",
    label: "Academic Setup",
    type: "section",
  },
  {
    icon: "schools",
    label: "Classes",
    path: "/school-admin/classes",
  },
  {
    icon: "book",
    label: "Subjects",
    path: "/school-admin/subjects",
  },
  {
    icon: "database",
    label: "Class-Subject Mapping",
    path: "/school-admin/class-subjects",
  },
  {
    icon: "users",
    label: "Teacher Assignments",
    path: "/school-admin/teacher-assignments",
  },
  {
    icon: "book",
    label: "Question Bank",
    path: "/school-admin/question-bank",
  },
  {
    icon: "fileText",
    label: "Exam Papers",
    path: "/school-admin/exam-papers",
  },
  {
    icon: "settings",
    label: "Settings",
    path: "/school-admin/settings",
  },
];

function SchoolAdminLayout() {
  return <AppShell navItems={schoolAdminNavItems} />;
}

export default SchoolAdminLayout;
