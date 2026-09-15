import { useEffect } from "react";

import Icon from "../common/Icon.jsx";
import Sidebar from "./Sidebar.jsx";

function MobileSidebar({ isOpen, navItems, onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="mobile-sidebar mobile-sidebar--open">
      <button
        aria-label="Close navigation"
        className="mobile-sidebar__backdrop"
        onClick={onClose}
        type="button"
      />
      <div className="mobile-sidebar__panel">
        <button
          aria-label="Close navigation"
          className="icon-button mobile-sidebar__close"
          onClick={onClose}
          type="button"
        >
          <Icon name="close" size={20} />
        </button>
        <Sidebar navItems={navItems} onNavigate={onClose} />
      </div>
    </div>
  );
}

export default MobileSidebar;
