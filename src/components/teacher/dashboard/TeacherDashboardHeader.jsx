import Avatar from "../../common/Avatar.jsx";

function TeacherDashboardHeader({ teacher }) {
  const displayName = teacher?.name || teacher?.email || "Teacher";
  const schoolLabel = teacher?.schoolName || teacher?.school || "";

  return (
    <section className="teacher-dashboard-header">
      <div className="teacher-dashboard-header__identity">
        <Avatar
          email={teacher?.email}
          name={displayName}
          photoURL={teacher?.photoURL}
          size="md"
        />
        <div>
          <p className="teacher-dashboard-header__eyebrow">
            Teacher Dashboard
          </p>
          <h1>Welcome, {displayName}</h1>
          {schoolLabel && <p>{schoolLabel}</p>}
        </div>
      </div>
    </section>
  );
}

export default TeacherDashboardHeader;
