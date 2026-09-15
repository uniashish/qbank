import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import EmptyTeachersState from "../../components/teachers/EmptyTeachersState.jsx";
import TeacherInvitationCard from "../../components/teachers/TeacherInvitationCard.jsx";
import TeachersList from "../../components/teachers/TeachersList.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getInvitationUrl } from "../../services/invitationService.js";
import {
  cancelTeacherInvitation,
  getTeacherInvitationsForSchool,
  getTeachersForSchool,
} from "../../services/teacherService.js";

function TeachersPage() {
  const { userProfile } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [cancellingInvitationId, setCancellingInvitationId] = useState("");

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
        const [teacherRecords, invitationRecords] = await Promise.all([
          getTeachersForSchool(schoolId),
          getTeacherInvitationsForSchool(schoolId),
        ]);

        if (!isMounted) {
          return;
        }

        setTeachers(teacherRecords);
        setInvitations(invitationRecords);
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

  const handleCancelInvitation = async (invitation) => {
    if (!invitation?.id || cancellingInvitationId) {
      return;
    }

    setCancellingInvitationId(invitation.id);
    setFeedback({ message: "", type: "" });

    try {
      await cancelTeacherInvitation(invitation.id);
      setInvitations((currentInvitations) =>
        currentInvitations.map((currentInvitation) =>
          currentInvitation.id === invitation.id
            ? { ...currentInvitation, status: "cancelled" }
            : currentInvitation,
        ),
      );
      setFeedback({ message: "Teacher invitation cancelled.", type: "success" });
    } catch (error) {
      console.error("[Teacher management] Failed to cancel invitation.", {
        invitationId: invitation.id,
        error,
      });
      setFeedback({
        message: "The teacher invitation could not be cancelled.",
        type: "error",
      });
    } finally {
      setCancellingInvitationId("");
    }
  };

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
        actions={
          <Link
            className="link-button link-button--primary"
            to="/school-admin/teachers/invite"
          >
            <Icon name="plus" size={18} />
            <span>Invite Teacher</span>
          </Link>
        }
        description="Manage teacher access for your school."
        schoolName="School Workspace"
        title="Teachers"
      />

      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      {teachers.length > 0 ? (
        <TeachersList teachers={teachers} />
      ) : (
        <EmptyTeachersState />
      )}

      <section className="teacher-invitations-section">
        <div className="teachers-section-header">
          <div>
            <h2>Teacher invitations</h2>
            <p>Pending, accepted and cancelled invitations for this school.</p>
          </div>
          <span>{invitations.length}</span>
        </div>

        {invitations.length > 0 ? (
          <div className="teacher-invitations-list">
            {invitations.map((invitation) => (
              <TeacherInvitationCard
                invitation={invitation}
                invitationUrl={getInvitationUrl(invitation.token)}
                isCancelling={cancellingInvitationId === invitation.id}
                key={invitation.id}
                onCancel={handleCancelInvitation}
              />
            ))}
          </div>
        ) : (
          <p className="teacher-invitations-section__empty">
            No teacher invitations have been created yet.
          </p>
        )}
      </section>
    </PageContainer>
  );
}

export default TeachersPage;
