import { useNavigate } from "react-router-dom";

import Button from "../../components/common/Button.jsx";
import { useAuth } from "../../hooks/useAuth.js";

function AccountNotProvisionedPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="auth-state-page">
      <section className="auth-state-card" aria-labelledby="not-provisioned-title">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <h1 id="not-provisioned-title">Account not provisioned</h1>
        <p>
          Your sign-in was successful, but your account does not have a QBank
          user profile yet.
        </p>
        <p>Please contact your administrator.</p>
        <Button onClick={handleLogout}>Sign out</Button>
      </section>
    </main>
  );
}

export default AccountNotProvisionedPage;
