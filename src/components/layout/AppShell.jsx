import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import MobileSidebar from "./MobileSidebar.jsx";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

function getCurrentTitle(navItems, pathname) {
  const navigableItems = navItems.filter((item) => item.path);
  const exactMatch = navigableItems.find((item) => item.path === pathname);

  if (exactMatch) {
    return exactMatch.label;
  }

  const partialMatch = navigableItems
    .filter((item) => pathname.startsWith(`${item.path}/`))
    .sort((first, second) => second.path.length - first.path.length)[0];

  return partialMatch?.label ?? "Dashboard";
}

function AppShell({ navItems }) {
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const currentTitle = useMemo(
    () => getCurrentTitle(navItems, location.pathname),
    [location.pathname, navItems],
  );

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="app-shell__desktop-sidebar">
        <Sidebar navItems={navItems} />
      </div>
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        navItems={navItems}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="app-shell__workspace">
        <Topbar
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          title={currentTitle}
        />
        <main className="app-shell__main" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppShell;
