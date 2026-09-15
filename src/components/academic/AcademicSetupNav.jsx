import { NavLink } from "react-router-dom";

const academicSetupItems = [
  {
    end: true,
    label: "Classes",
    path: "/school-admin/classes",
  },
  {
    label: "Subjects",
    path: "/school-admin/subjects",
  },
  {
    label: "Class-Subject Mapping",
    path: "/school-admin/class-subjects",
  },
  {
    label: "Teacher Assignments",
    path: "/school-admin/teacher-assignments",
  },
];

function AcademicSetupNav() {
  return (
    <nav className="academic-setup-nav" aria-label="Academic setup">
      {academicSetupItems.map((item) => (
        <NavLink
          className={({ isActive }) =>
            [
              "academic-setup-nav__item",
              isActive ? "academic-setup-nav__item--active" : "",
            ]
              .filter(Boolean)
              .join(" ")
          }
          end={item.end}
          key={item.path}
          to={item.path}
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default AcademicSetupNav;
