const tabs = [
  { id: "joinRequests", label: "Join Requests" },
  { id: "teachers", label: "Teachers" },
  { id: "schoolAdmins", label: "School Admins" },
];

function UserTabs({ activeTab, counts, onChange }) {
  return (
    <div className="school-users-tabs" role="tablist" aria-label="School users">
      {tabs.map((tab) => (
        <button
          aria-selected={activeTab === tab.id}
          className={
            activeTab === tab.id
              ? "school-users-tab school-users-tab--active"
              : "school-users-tab"
          }
          key={tab.id}
          onClick={() => onChange(tab.id)}
          role="tab"
          type="button"
        >
          <span>{tab.label}</span>
          <strong>{counts[tab.id] ?? 0}</strong>
        </button>
      ))}
    </div>
  );
}

export default UserTabs;
