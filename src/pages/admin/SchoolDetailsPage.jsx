import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import SchoolDetailsCard from "../../components/schools/SchoolDetailsCard.jsx";
import SchoolStatusBadge from "../../components/schools/SchoolStatusBadge.jsx";
import {
  SCHOOL_STATUSES,
  SCHOOL_STATUS_LABELS,
} from "../../constants/schoolStatus.js";
import {
  getSchoolById,
  updateSchoolStatus,
} from "../../services/schoolService.js";
import { getUserProfile } from "../../services/userService.js";
import { formatDate } from "../../utils/formatDate.js";

function getNextStatus(status) {
  return status === SCHOOL_STATUSES.ACTIVE
    ? SCHOOL_STATUSES.INACTIVE
    : SCHOOL_STATUSES.ACTIVE;
}

function getStatusActionLabel(status) {
  return status === SCHOOL_STATUSES.ACTIVE
    ? "Deactivate School"
    : "Activate School";
}

function SchoolDetailsPage() {
  const { schoolId } = useParams();
  const [school, setSchool] = useState(null);
  const [primaryAdminProfile, setPrimaryAdminProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [error, setError] = useState("");
  const [statusFeedback, setStatusFeedback] = useState({
    message: "",
    type: "",
  });
  const [pendingStatus, setPendingStatus] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSchool() {
      setIsLoading(true);
      setError("");

      try {
        const schoolRecord = await getSchoolById(schoolId);

        if (!isMounted) {
          return;
        }

        if (!schoolRecord) {
          setError("School not found.");
          setSchool(null);
          return;
        }

        setSchool(schoolRecord);

        if (schoolRecord.primaryAdminId) {
          const adminRecord = await getUserProfile(schoolRecord.primaryAdminId);

          if (isMounted) {
            setPrimaryAdminProfile(adminRecord);
          }
        } else {
          setPrimaryAdminProfile(null);
        }
      } catch {
        if (isMounted) {
          setError("School details could not be loaded. Try again in a moment.");
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
  }, [schoolId]);

  const handleStatusChange = async () => {
    if (!pendingStatus || !school || isUpdatingStatus) {
      return;
    }

    setIsUpdatingStatus(true);
    setStatusFeedback({ message: "", type: "" });

    try {
      await updateSchoolStatus(school.id, pendingStatus);
      setSchool((currentSchool) => ({
        ...currentSchool,
        status: pendingStatus,
      }));
      setPendingStatus(null);
      setStatusFeedback({
        message: "School status updated.",
        type: "success",
      });
    } catch {
      setStatusFeedback({
        message: "School status could not be updated.",
        type: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading school details" />
          <p>Loading school details...</p>
        </section>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer size="narrow">
        <section className="schools-state-card schools-state-card--error" role="alert">
          <Icon name="alert" size={22} />
          <p>{error}</p>
          <Link className="link-button link-button--secondary" to="/admin/schools">
            Back to schools
          </Link>
        </section>
      </PageContainer>
    );
  }

  const nextStatus = getNextStatus(school.status);

  return (
    <PageContainer>
      <DashboardHeader
        actions={
          <Link className="link-button link-button--secondary" to="/admin/schools">
            Back to schools
          </Link>
        }
        description="Review school profile, contact information and platform setup status."
        title={school.name}
      />

      <section className="school-hero-card">
        <div>
          <p className="school-hero-card__eyebrow">School record</p>
          <h2>{school.name}</h2>
          <p>{school.code}</p>
        </div>
        <SchoolStatusBadge status={school.status} />
      </section>

      <div className="school-details-grid">
        <SchoolDetailsCard
          items={[
            { label: "School Email", value: school.email },
            { label: "Phone", value: school.phone },
            { label: "City", value: school.city },
            { label: "Country", value: school.country },
          ]}
          title="Contact Information"
        />
        <SchoolDetailsCard
          items={[
            { label: "Address", value: school.address },
            { label: "Created", value: formatDate(school.createdAt) },
            { label: "Updated", value: formatDate(school.updatedAt) },
            { label: "Created By", value: school.createdBy },
          ]}
          title="Address and Metadata"
        />
      </div>

      <div className="school-details-grid">
        <SchoolDetailsCard title="School Status">
          <div className="school-status-panel">
            <SchoolStatusBadge status={school.status} />
            <p>
              Inactive schools remain visible to platform admins and can be
              reactivated later.
            </p>
            {statusFeedback.message && (
              <p
                className={`school-status-panel__feedback school-status-panel__feedback--${statusFeedback.type}`}
              >
                {statusFeedback.message}
              </p>
            )}
            {!pendingStatus && (
              <button
                className="link-button link-button--secondary"
                onClick={() => setPendingStatus(nextStatus)}
                type="button"
              >
                {getStatusActionLabel(school.status)}
              </button>
            )}
            {pendingStatus && (
              <div className="school-confirmation">
                <p>
                  Confirm this change to mark the school as{" "}
                  {SCHOOL_STATUS_LABELS[pendingStatus].toLowerCase()}.
                </p>
                <div className="school-confirmation__actions">
                  <button
                    className="link-button link-button--primary"
                    disabled={isUpdatingStatus}
                    onClick={handleStatusChange}
                    type="button"
                  >
                    {isUpdatingStatus ? "Updating..." : "Confirm"}
                  </button>
                  <button
                    className="link-button link-button--secondary"
                    disabled={isUpdatingStatus}
                    onClick={() => setPendingStatus(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </SchoolDetailsCard>

        <SchoolDetailsCard title="Primary School Administrator">
          <div className="school-admin-panel">
            {primaryAdminProfile ? (
              <div className="school-admin-panel__assigned">
                <strong>{primaryAdminProfile.name || "School Admin"}</strong>
                <span>{primaryAdminProfile.email}</span>
              </div>
            ) : school.primaryAdminId ? (
              <p>{school.primaryAdminId}</p>
            ) : (
              <p>No school administrator assigned yet.</p>
            )}
            <Link
              className="link-button link-button--secondary"
              to={`/admin/schools/${school.id}/admin`}
            >
              Assign School Admin
            </Link>
          </div>
        </SchoolDetailsCard>
      </div>
    </PageContainer>
  );
}

export default SchoolDetailsPage;
