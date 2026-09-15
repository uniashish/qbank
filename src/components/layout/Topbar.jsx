import Icon from "../common/Icon.jsx";
import UserMenu from "./UserMenu.jsx";

function Topbar({ onMenuClick, title }) {
  return (
    <header className="app-topbar">
      <div className="app-topbar__title">
        <button
          aria-label="Open navigation"
          className="icon-button app-topbar__menu"
          onClick={onMenuClick}
          type="button"
        >
          <Icon name="menu" size={21} />
        </button>
        <span>{title}</span>
      </div>
      <UserMenu />
    </header>
  );
}

export default Topbar;
