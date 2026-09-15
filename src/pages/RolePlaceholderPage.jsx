import { Link } from "react-router-dom";

function RolePlaceholderPage({ description, title }) {
  return (
    <main className="dashboard-placeholder">
      <section className="dashboard-placeholder__panel">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link className="placeholder-link" to="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

export default RolePlaceholderPage;
