import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import InviteAdminForm from "../../components/invitations/InviteAdminForm.jsx";
import InvitationLinkCard from "../../components/invitations/InvitationLinkCard.jsx";
import InvitationSummary from "../../components/invitations/InvitationSummary.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import SchoolDetailsCard from "../../components/schools/SchoolDetailsCard.jsx";
import SchoolStatusBadge from "../../components/schools/SchoolStatusBadge.jsx";
import { SCHOOL_STATUSES } from "../../constants/schoolStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  cancelInvitation,
  createSchoolAdminInvitation,
  getInvitationUrl,
  getPendingSchoolAdminInvitation,
} from "../../services/invitationService.js";
import { getSchoolById } from "../../services/schoolService.js";
import { getUserProfile } from "../../services/userService.js";
import { validateInviteAdminForm } from "../../utils/invitationValidation.js";

const initialValues = {
  email: "",
  name: "",
};

const initialErrors = {
  email: "",
  name: "",
};

function AssignSchoolAdminPage() {
  const { schoolId } = useParams();
  const { firebaseUser } = useAuth();
  const [school, setSchool] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [pendingInvitation, setPendingInvitation] = useState(null);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadAssignmentState() {
      setIsLoading(true);
      setPageError("");

      try {
        const schoolRecord = await getSchoolById(schoolId);

        if (!isMounted) {
          return;
        }

        if (!schoolRecord) {
          setPageError("School not found.");
          setSchool(null);
          return;
        }

        setSchool(schoolRecord);

        const [adminRecord, invitationRecord] = await Promise.all([
          schoolRecord.primaryAdminId
            ? getUserProfile(schoolRecord.primaryAdminId)
            : Promise.resolve(null),
          getPendingSchoolAdminInvitation(schoolRecord.id),
        ]);

        if (isMounted) {
          setAdminProfile(adminRecord);
          setPendingInvitation(invitationRecord);
        }
      } catch {
        if (isMounted) {
          setPageError(
            "School administrator assignment details could not be loaded.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAssignmentState();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

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

    const validation = validateInviteAdminForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before assigning an admin.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      const invitation = await createSchoolAdminInvitation({
        ...validation.values,
        invitedByUid: firebaseUser?.uid ?? null,
        school,
      });

      setPendingInvitation(invitation);
      setValues(initialValues);
      setFeedback({
        message: "School Admin invitation created.",
        type: "success",
      });
    } catch (error) {
      setFeedback({
        message:
          error.message ||
          "The School Admin invitation could not be created. Try again in a moment.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelInvitation = async () => {
    if (!pendingInvitation || isCancelling) {
      return;
    }

    setIsCancelling(true);
    setFeedback({ message: "", type: "" });

    try {
      await cancelInvitation(pendingInvitation.id);
      setPendingInvitation(null);
      setFeedback({
        message: "Invitation cancelled.",
        type: "success",
      });
    } catch {
      setFeedback({
        message: "The invitation could not be cancelled. Try again in a moment.",
        type: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading assignment details" />
          <p>Loading assignment details...</p>
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
          <Link className="link-button link-button--secondary" to="/admin/schools">
            Back to schools
          </Link>
        </section>
      </PageContainer>
    );
  }

  const isAssigned = Boolean(school.primaryAdminId || adminProfile);
  const isInactive = school.status !== SCHOOL_STATUSES.ACTIVE;

  return (
    <PageContainer>
      <DashboardHeader
        actions={
          <Link
            className="link-button link-button--secondary"
            to={`/admin/schools/${school.id}`}
          >
            Back to school
          </Link>
        }
        description="Create a secure invitation link for the first School Admin."
        title="Assign School Admin"
      />

      <section className="school-hero-card">
        <div>
          <p className="school-hero-card__eyebrow">School</p>
          <h2>{school.name}</h2>
          <p>{school.code}</p>
        </div>
        <SchoolStatusBadge status={school.status} />
      </section>

      <InvitationSummary
        adminProfile={adminProfile}
        invitation={pendingInvitation}
      />

      {pendingInvitation && (
        <InvitationLinkCard
          invitationUrl={getInvitationUrl(pendingInvitation.token)}
          isCancelling={isCancelling}
          onCancel={handleCancelInvitation}
        />
      )}

      {!isAssigned && (
        <SchoolDetailsCard title="Invite School Admin">
          <div className="invite-admin-panel">
            {isInactive && (
              <p className="invite-admin-panel__notice">
                Activate this school before assigning a School Admin.
              </p>
            )}
            {pendingInvitation && (
              <p className="invite-admin-panel__notice">
                A pending invitation already exists for this school.
              </p>
            )}
            <InviteAdminForm
              disabled={isInactive || Boolean(pendingInvitation)}
              errors={errors}
              feedback={feedback}
              isSubmitting={isSubmitting}
              onChange={handleChange}
              onSubmit={handleSubmit}
              values={values}
            />
          </div>
        </SchoolDetailsCard>
      )}
    </PageContainer>
  );
}

export default AssignSchoolAdminPage;
