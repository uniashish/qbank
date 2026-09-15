import { useEffect, useState } from "react";

import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import QuickActions from "../../components/school-admin/QuickActions.jsx";
import StatCard from "../../components/school-admin/StatCard.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getSchoolById } from "../../services/schoolService.js";

const overviewStats = [
  {
    icon: "users",
    label: "Teachers",
    value: "—",
  },
  {
    icon: "users",
    label: "Students",
    value: "—",
  },
  {
    icon: "book",
    label: "Questions",
    value: "—",
  },
  {
    icon: "fileText",
    label: "Exam Papers",
    value: "—",
  },
];

const quickActions = [
  {
    icon: "users",
    label: "Teachers",
    path: "/school-admin/teachers",
  },
  {
    icon: "schools",
    label: "Academic Setup",
    path: "/school-admin/classes",
  },
  {
    icon: "book",
    label: "Question Bank",
    path: "/school-admin/question-bank",
  },
  {
    icon: "fileText",
    label: "Exam Papers",
    path: "/school-admin/exam-papers",
  },
];

function SchoolAdminDashboard() {
  const { userProfile } = useAuth();
  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSchool() {
      if (!userProfile?.schoolId) {
        setError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const schoolRecord = await getSchoolById(userProfile.schoolId);

        if (!isMounted) {
          return;
        }

        if (!schoolRecord) {
          setError("The linked school could not be found.");
          setSchool(null);
          return;
        }

        setSchool(schoolRecord);
      } catch {
        if (isMounted) {
          setError("School dashboard data could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchool();

    return () => {
      isMounted = false;
    };
  }, [userProfile?.schoolId]);

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading school dashboard" />
          <p>Loading school dashboard...</p>
        </section>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer size="narrow">
        <section className="schools-state-card schools-state-card--error" role="alert">
          <p>{error}</p>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader
        description="Manage your school workspace and prepare education content."
        schoolName={school.name}
        title="School Dashboard"
      />

      <section className="school-admin-card" aria-labelledby="school-overview-title">
        <div className="school-admin-card__header">
          <h2 id="school-overview-title">Overview</h2>
          <p>Live totals will appear here once these workflows are implemented.</p>
        </div>
        <div className="school-admin-stats-grid">
          {overviewStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </section>

      <QuickActions actions={quickActions} />
    </PageContainer>
  );
}

export default SchoolAdminDashboard;
