import { useState } from "react";
import { Link } from "react-router-dom";

import Icon from "../../components/common/Icon.jsx";
import InvitationLinkCard from "../../components/invitations/InvitationLinkCard.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import InviteTeacherForm from "../../components/teachers/InviteTeacherForm.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { sendInvitationEmail } from "../../services/invitationEmailService.js";
import { getInvitationUrl } from "../../services/invitationService.js";
import { createTeacherInvitation } from "../../services/teacherService.js";
import { validateInviteTeacherForm } from "../../utils/invitationValidation.js";

const initialValues = {
  email: "",
  name: "",
};

const initialErrors = {
  email: "",
  name: "",
};

function InviteTeacherPage() {
  const { firebaseUser, userProfile } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [createdInvitation, setCreatedInvitation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolId = userProfile?.schoolId ?? "";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation = validateInviteTeacherForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before inviting a teacher.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      const invitation = await createTeacherInvitation({
        ...validation.values,
        invitedByUid: firebaseUser?.uid ?? null,
        schoolId,
      });
      let emailSent = true;

      try {
        await sendInvitationEmail(
          {
            invitationId: invitation.id,
            schoolId: invitation.schoolId,
          },
          firebaseUser,
        );
      } catch (emailError) {
        emailSent = false;
        console.error("[Teacher management] Failed to send teacher invitation email.", {
          invitationId: invitation.id,
          schoolId: invitation.schoolId,
          error: emailError,
        });
      }

      setCreatedInvitation(invitation);
      setValues(initialValues);
      setErrors(initialErrors);
      setFeedback({
        message: emailSent
          ? "Teacher invitation created and emailed."
          : "Teacher invitation created, but email delivery failed. Copy the invite link below.",
        type: emailSent ? "success" : "warning",
      });
    } catch (error) {
      console.error("[Teacher management] Failed to create teacher invitation.", {
        schoolId,
        error,
      });
      setFeedback({
        message:
          error.message ||
          "The teacher invitation could not be created. Try again in a moment.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <DashboardHeader
        actions={
          <Link className="link-button link-button--secondary" to="/school-admin/teachers">
            Back to teachers
          </Link>
        }
        description="Create a secure self-registration link for a teacher."
        schoolName="School Workspace"
        title="Invite Teacher"
      />

      {createdInvitation && (
        <InvitationLinkCard
          invitationUrl={getInvitationUrl(createdInvitation.token)}
          recipientLabel="Teacher"
        />
      )}

      <section className="teacher-form-card">
        <div className="teachers-section-header">
          <div>
            <h2>Teacher details</h2>
            <p>The invitation will be tied to your school automatically.</p>
          </div>
          <Icon name="mail" size={22} />
        </div>

        {!schoolId && (
          <div className="school-feedback school-feedback--error" role="alert">
            No school is linked to this account.
          </div>
        )}

        <InviteTeacherForm
          disabled={!schoolId}
          errors={errors}
          feedback={feedback}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          values={values}
        />
      </section>
    </PageContainer>
  );
}

export default InviteTeacherPage;
