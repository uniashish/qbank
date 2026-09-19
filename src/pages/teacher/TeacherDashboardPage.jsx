import { useEffect, useState } from "react";

import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import TeacherAssignmentsSummary from "../../components/teacher/dashboard/TeacherAssignmentsSummary.jsx";
import TeacherDashboardHeader from "../../components/teacher/dashboard/TeacherDashboardHeader.jsx";
import TeacherQuickActions from "../../components/teacher/dashboard/TeacherQuickActions.jsx";
import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getSchoolById } from "../../services/schoolService.js";
import { getAssignmentsForCurrentTeacher } from "../../services/teacherAssignmentService.js";

function TeacherDashboardPage() {
  const { userProfile } = useAuth();
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const teacherId = userProfile?.uid ?? "";
  const schoolId = userProfile?.schoolId ?? "";
  const isPendingApproval =
    userProfile?.status === ACCOUNT_STATUSES.PENDING_APPROVAL;

  useEffect(() => {
    let isMounted = true;

    async function loadAssignments() {
      if (isPendingApproval) {
        return;
      }

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
  }, [isPendingApproval, schoolId, teacherId]);

  if (isPendingApproval) {
    return <PendingTeacherDashboard teacher={userProfile} />;
  }

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

function PendingTeacherDashboard({ teacher }) {
  const [schoolName, setSchoolName] = useState("");
  const [isLoadingSchool, setIsLoadingSchool] = useState(true);
  const schoolId = teacher?.schoolId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadSchoolName() {
      if (!schoolId) {
        setIsLoadingSchool(false);
        return;
      }

      try {
        const school = await getSchoolById(schoolId);

        if (isMounted) {
          setSchoolName(school?.name ?? "your school");
        }
      } catch (error) {
        console.error("[Teacher dashboard] Failed to load pending school.", {
          error,
          schoolId,
        });

        if (isMounted) {
          setSchoolName("your school");
        }
      } finally {
        if (isMounted) {
          setIsLoadingSchool(false);
        }
      }
    }

    loadSchoolName();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  return (
    <PageContainer size="narrow">
      <TeacherDashboardHeader teacher={teacher} />
      <section className="teacher-dashboard-pending" aria-live="polite">
        <Icon name="clock" size={24} />
        <div>
          <h2>Account awaiting approval</h2>
          <p>
            Your request to join{" "}
            <strong>{isLoadingSchool ? "your school" : schoolName}</strong> is
            awaiting approval.
          </p>
          <p>
            Your school administrator must approve your account and assign your
            classes and subjects before you can use QBank.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}

export default TeacherDashboardPage;
