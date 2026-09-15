import SidebarNavItem from "./SidebarNavItem.jsx";

function SidebarNav({ items, onNavigate }) {
  return (
    <nav className="sidebar-nav" aria-label="Primary navigation">
      {items.map((item) =>
        item.type === "section" ? (
          <div className="sidebar-nav__section" key={item.key ?? item.label}>
            {item.label}
          </div>
        ) : (
          <SidebarNavItem item={item} key={item.path} onNavigate={onNavigate} />
        ),
      )}
    </nav>
  );
}

export default SidebarNav;
