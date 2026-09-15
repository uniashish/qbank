import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import EmptySchoolsState from "../../components/schools/EmptySchoolsState.jsx";
import SchoolsTable from "../../components/schools/SchoolsTable.jsx";
import { getSchools } from "../../services/schoolService.js";

function SchoolsPage() {
  const [schools, setSchools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSchools() {
      setIsLoading(true);
      setError("");

      try {
        const schoolRecords = await getSchools();

        if (isMounted) {
          setSchools(schoolRecords);
        }
      } catch {
        if (isMounted) {
          setError("Schools could not be loaded. Try again in a moment.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchools();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageContainer>
      <DashboardHeader
        actions={
          <Link className="link-button link-button--primary" to="/admin/schools/new">
            <Icon name="plus" size={18} />
            <span>Add School</span>
          </Link>
        }
        description="Create and manage institution records for the QBank platform."
        title="Schools"
      />

      {isLoading && (
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading schools" />
          <p>Loading schools...</p>
        </section>
      )}

      {!isLoading && error && (
        <section className="schools-state-card schools-state-card--error" role="alert">
          <Icon name="alert" size={22} />
          <p>{error}</p>
        </section>
      )}

      {!isLoading && !error && schools.length === 0 && <EmptySchoolsState />}

      {!isLoading && !error && schools.length > 0 && (
        <SchoolsTable schools={schools} />
      )}
    </PageContainer>
  );
}

export default SchoolsPage;
