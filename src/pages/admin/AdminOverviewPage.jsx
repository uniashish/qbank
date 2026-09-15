import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import QuickActions from "../../components/admin/dashboard/QuickActions.jsx";
import RecentActivity from "../../components/admin/dashboard/RecentActivity.jsx";
import StatsGrid from "../../components/admin/dashboard/StatsGrid.jsx";
import SystemStatusCard from "../../components/admin/dashboard/SystemStatusCard.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";

const placeholderStats = [
  {
    description: "Registered institutions",
    icon: "schools",
    title: "Schools",
    value: 0,
  },
  {
    description: "Provisioned school leaders",
    icon: "administrators",
    title: "School Administrators",
    value: 0,
  },
  {
    description: "Teacher accounts",
    icon: "users",
    title: "Teachers",
    value: 0,
  },
  {
    description: "Student accounts",
    icon: "users",
    title: "Students",
    value: 0,
  },
];

const placeholderActions = [
  {
    description: "Create a new institution record",
    icon: "plus",
    label: "Add School",
    path: "/admin/schools/new",
  },
  {
    description: "Prepare school administrator access",
    icon: "administrators",
    label: "Invite Administrator",
    path: "/admin/administrators",
  },
  {
    description: "Review all platform users",
    icon: "users",
    label: "View Users",
    path: "/admin/users",
  },
  {
    description: "Manage platform configuration",
    icon: "settings",
    label: "Platform Settings",
    path: "/admin/settings",
  },
];

function AdminOverviewPage() {
  return (
    <PageContainer>
      <DashboardHeader
        description="Manage schools, administrators, users and system access across QBank."
        title="Platform Overview"
      />
      <StatsGrid stats={placeholderStats} />
      <div className="dashboard-grid">
        <QuickActions actions={placeholderActions} />
        <SystemStatusCard />
      </div>
      <RecentActivity />
    </PageContainer>
  );
}

export default AdminOverviewPage;
