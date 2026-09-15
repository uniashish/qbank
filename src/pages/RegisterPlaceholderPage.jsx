import { Link } from "react-router-dom";

function RegisterPlaceholderPage() {
  return (
    <main className="dashboard-placeholder">
      <section className="dashboard-placeholder__panel">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1>Create account</h1>
        <p>
          Registration is not available yet. Ask your school administrator to
          create or invite your account.
        </p>
        <Link className="placeholder-link" to="/login">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

export default RegisterPlaceholderPage;
