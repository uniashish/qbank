import { Link } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";
import { getDefaultRouteForRole } from "../../utils/getDefaultRouteForRole.js";

function UnauthorizedPage() {
  const { role } = useAuth();
  const defaultRoute = getDefaultRouteForRole(role);
  const canReturnHome = role && defaultRoute !== "/unauthorized";

  return (
    <main className="auth-state-page">
      <section className="auth-state-card" aria-labelledby="unauthorized-title">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1 id="unauthorized-title">Access denied</h1>
        <p>You do not have permission to view this page.</p>
        {canReturnHome ? (
          <Link className="auth-state-card__action" to={defaultRoute}>
            Return to dashboard
          </Link>
        ) : (
          <Link className="auth-state-card__action" to="/login">
            Back to sign in
          </Link>
        )}
      </section>
    </main>
  );
}

export default UnauthorizedPage;
