import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";

function AdminPlaceholderPage({ description, title }) {
  return (
    <PageContainer size="narrow">
      <DashboardHeader description={description} title={title} />
      <section className="dashboard-card">
        <div className="placeholder-panel">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <h2>{title} workflows are not configured yet.</h2>
          <p>
            This area is ready for the next implementation phase without adding
            incomplete production actions.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}

export default AdminPlaceholderPage;
