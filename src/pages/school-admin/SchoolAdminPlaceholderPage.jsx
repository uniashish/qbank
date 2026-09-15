import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function SchoolAdminPlaceholderPage({ description, title }) {
  const { userProfile } = useAuth();

  return (
    <PageContainer size="narrow">
      <DashboardHeader
        description={description}
        schoolName={userProfile?.name ? "School Workspace" : "QBank"}
        title={title}
      />
      <section className="school-admin-card">
        <div className="placeholder-panel">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <h2>{title} workflows are not configured yet.</h2>
          <p>This section is reserved for a later School Admin phase.</p>
        </div>
      </section>
    </PageContainer>
  );
}

export default SchoolAdminPlaceholderPage;
