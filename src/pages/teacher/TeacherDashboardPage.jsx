import { useEffect, useState } from "react";

import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import TeacherAssignmentsSummary from "../../components/teacher/dashboard/TeacherAssignmentsSummary.jsx";
import TeacherDashboardHeader from "../../components/teacher/dashboard/TeacherDashboardHeader.jsx";
import TeacherQuickActions from "../../components/teacher/dashboard/TeacherQuickActions.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getAssignmentsForCurrentTeacher } from "../../services/teacherAssignmentService.js";

function TeacherDashboardPage() {
  const { userProfile } = useAuth();
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const teacherId = userProfile?.uid ?? "";
  const schoolId = userProfile?.schoolId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      if (!teacherId || !schoolId) {
        setAssignmentGroups([]);
        setPageError("Your teacher account is not linked to a school.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const assignments = await getAssignmentsForCurrentTeacher(
          schoolId,
          teacherId,
        );

        if (isMounted) {
          setAssignmentGroups(assignments);
        }
      } catch (error) {
        console.error("[Teacher dashboard] Failed to load assignments.", {
          error,
          schoolId,
          teacherId,
        });

        if (isMounted) {
          setPageError("Your class and subject assignments could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAssignments();

    return () => {
      isMounted = false;
    };
  }, [schoolId, teacherId]);

  if (isLoading) {
    return (
      <PageContainer>
        <section className="teacher-dashboard-state" aria-live="polite">
          <Spinner label="Loading teacher dashboard" />
          <p>Loading teacher dashboard...</p>
        </section>
      </PageContainer>
    );
  }

  if (pageError) {
    return (
      <PageContainer size="narrow">
        <section
          className="teacher-dashboard-state teacher-dashboard-state--error"
          role="alert"
        >
          <Icon name="alert" size={22} />
          <p>{pageError}</p>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <TeacherDashboardHeader teacher={userProfile} />
      <TeacherAssignmentsSummary assignmentGroups={assignmentGroups} />
      <TeacherQuickActions />
    </PageContainer>
  );
}

export default TeacherDashboardPage;
