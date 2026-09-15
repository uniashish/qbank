import { Link } from "react-router-dom";

import Icon from "../common/Icon.jsx";

function EmptySchoolsState() {
  return (
    <section className="empty-schools-state">
      <span className="empty-schools-state__icon" aria-hidden="true">
        <Icon name="schools" size={26} />
      </span>
      <h2>No schools yet</h2>
      <p>Create the first school record to start preparing QBank access.</p>
      <Link className="link-button link-button--primary" to="/admin/schools/new">
        Add School
      </Link>
    </section>
  );
}

export default EmptySchoolsState;
