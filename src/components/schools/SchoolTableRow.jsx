import SchoolActionsMenu from "./SchoolActionsMenu.jsx";
import SchoolStatusBadge from "./SchoolStatusBadge.jsx";
import { formatDate } from "../../utils/formatDate.js";

function getLocation(school) {
  return [school.city, school.country].filter(Boolean).join(", ") || "Not set";
}

function SchoolTableRow({ school }) {
  return (
    <tr>
      <td data-label="School">
        <div className="school-table__identity">
          <strong>{school.name}</strong>
          {school.email ? <span>{school.email}</span> : null}
        </div>
      </td>
      <td data-label="Code">{school.code}</td>
      <td data-label="Location">{getLocation(school)}</td>
      <td data-label="Status">
        <SchoolStatusBadge status={school.status} />
      </td>
      <td data-label="Primary Admin">
        {school.primaryAdminId || "Not assigned"}
      </td>
      <td data-label="Created">{formatDate(school.createdAt)}</td>
      <td data-label="Actions">
        <SchoolActionsMenu school={school} />
      </td>
    </tr>
  );
}

export default SchoolTableRow;
