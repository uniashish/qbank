import { Link } from "react-router-dom";

function SchoolActionsMenu({ school }) {
  return (
    <div className="school-actions">
      <Link to={`/admin/schools/${school.id}`}>View details</Link>
    </div>
  );
}

export default SchoolActionsMenu;
