import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Avatar from "../common/Avatar.jsx";
import Icon from "../common/Icon.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getRoleLabel } from "../../utils/getRoleLabel.js";

function UserMenu() {
  const navigate = useNavigate();
  const { firebaseUser, logout, role, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const displayName =
    userProfile?.name || firebaseUser?.displayName || firebaseUser?.email;
  const email = userProfile?.email || firebaseUser?.email;
  const photoURL = userProfile?.photoURL || firebaseUser?.photoURL;

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="user-menu">
      <button
        aria-expanded={isOpen}
        className="user-menu__trigger"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Avatar email={email} name={displayName} photoURL={photoURL} />
        <span className="user-menu__summary">
          <span className="user-menu__name">{displayName || "QBank user"}</span>
          <span className="user-menu__role">{getRoleLabel(role)}</span>
        </span>
        <Icon name="chevronDown" size={16} />
      </button>

      {isOpen && (
        <div className="user-menu__panel">
          <div className="user-menu__details">
            <p>{displayName || "QBank user"}</p>
            <span>{email}</span>
          </div>
          <button
            className="user-menu__action"
            onClick={handleLogout}
            type="button"
          >
            <Icon name="logout" size={18} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default UserMenu;
