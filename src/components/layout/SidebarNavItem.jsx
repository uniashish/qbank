import { NavLink } from "react-router-dom";

import Icon from "../common/Icon.jsx";

function SidebarNavItem({ item, onNavigate }) {
  return (
    <NavLink
      className={({ isActive }) =>
        ["sidebar-nav__item", isActive ? "sidebar-nav__item--active" : ""]
          .filter(Boolean)
          .join(" ")
      }
      end={item.end}
      onClick={onNavigate}
      to={item.path}
    >
      <Icon className="sidebar-nav__icon" name={item.icon} size={19} />
      <span>{item.label}</span>
    </NavLink>
  );
}

export default SidebarNavItem;
