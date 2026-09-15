import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function AccountDisabledPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="auth-state-page">
      <section className="auth-state-card" aria-labelledby="disabled-title">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1 id="disabled-title">Account disabled</h1>
        <p>Your QBank account is currently disabled.</p>
        <p>Please contact your administrator for assistance.</p>
        <Button onClick={handleLogout}>Sign out</Button>
      </section>
    </main>
  );
}

export default AccountDisabledPage;
