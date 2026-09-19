import { useEffect, useState } from "react";

import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyTeachersState from "../../components/teachers/EmptyTeachersState.jsx";
import TeachersList from "../../components/teachers/TeachersList.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getTeachersForSchool } from "../../services/teacherService.js";

function TeachersPage() {
  const { userProfile } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const schoolId = userProfile?.schoolId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadTeachers() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const teacherRecords = await getTeachersForSchool(schoolId);

        if (!isMounted) {
          return;
        }

        setTeachers(teacherRecords);
      } catch (error) {
        console.error("[Teacher management] Failed to load teachers.", error);

        if (isMounted) {
          setPageError("Teacher management data could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadTeachers();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading teachers" />
          <p>Loading teachers...</p>
        </section>
      </PageContainer>
    );
  }

  if (pageError) {
    return (
      <PageContainer size="narrow">
        <section className="schools-state-card schools-state-card--error" role="alert">
          <Icon name="alert" size={22} />
          <p>{pageError}</p>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader
        description="View active and pending teacher accounts for your school."
        schoolName="School Workspace"
        title="Teachers"
      />

      {teachers.length > 0 ? (
        <TeachersList teachers={teachers} />
      ) : (
        <EmptyTeachersState />
      )}
    </PageContainer>
  );
}

export default TeachersPage;
