import PageContainer from "../../components/layout/PageContainer.jsx";

function TeacherPlaceholderPage({ description, title }) {
  return (
    <PageContainer size="narrow">
      <section className="placeholder-panel">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
    </PageContainer>
  );
}

export default TeacherPlaceholderPage;
