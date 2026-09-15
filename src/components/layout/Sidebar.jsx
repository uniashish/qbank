import SidebarBrand from "./SidebarBrand.jsx";
import SidebarNav from "./SidebarNav.jsx";

function Sidebar({ navItems, onNavigate }) {
  return (
    <aside className="app-sidebar">
      <SidebarBrand />
      <SidebarNav items={navItems} onNavigate={onNavigate} />
    </aside>
  );
}

export default Sidebar;
