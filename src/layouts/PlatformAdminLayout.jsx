import AppShell from "../components/layout/AppShell.jsx";

const platformAdminNavItems = [
  {
    end: true,
    icon: "dashboard",
    label: "Overview",
    path: "/admin",
  },
  {
    icon: "schools",
    label: "Schools",
    path: "/admin/schools",
  },
  {
    icon: "administrators",
    label: "Administrators",
    path: "/admin/administrators",
  },
  {
    icon: "users",
    label: "Users",
    path: "/admin/users",
  },
  {
    icon: "settings",
    label: "Settings",
    path: "/admin/settings",
  },
];

function PlatformAdminLayout() {
  return <AppShell navItems={platformAdminNavItems} />;
}

export default PlatformAdminLayout;
