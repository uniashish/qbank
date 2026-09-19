import { useEffect, useState } from "react";

import Button from "../../components/common/Button.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getSchoolById,
  updateSchoolJoinRequestSetting,
} from "../../services/schoolService.js";

function SchoolSettingsPage() {
  const { userProfile } = useAuth();
  const [school, setSchool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const schoolId = userProfile?.schoolId ?? "";
  const allowJoinRequests = school?.allowJoinRequests !== false;

  useEffect(() => {
    let isMounted = true;

    async function loadSchoolSettings() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const schoolRecord = await getSchoolById(schoolId);

        if (isMounted) {
          setSchool(schoolRecord);
        }
      } catch (error) {
        console.error("[School settings] Failed to load school settings.", {
          error,
          schoolId,
        });

        if (isMounted) {
          setPageError("School settings could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSchoolSettings();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const handleToggleJoinRequests = async () => {
    if (!school || isSaving) {
      return;
    }

    const nextValue = !allowJoinRequests;
    setIsSaving(true);
    setFeedback({ message: "", type: "" });

    try {
      await updateSchoolJoinRequestSetting(school.id, nextValue);
      setSchool((currentSchool) => ({
        ...currentSchool,
        allowJoinRequests: nextValue,
      }));
      setFeedback({
        message: nextValue
          ? "Join requests are now enabled."
          : "New join requests are now blocked.",
        type: "success",
      });
    } catch (error) {
      console.error("[School settings] Failed to update join request setting.", {
        error,
        schoolId,
      });
      setFeedback({
        message: "Join request setting could not be updated.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading school settings" />
          <p>Loading school settings...</p>
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
        description="Manage school-level access settings."
        schoolName={school?.name ?? "School Workspace"}
        title="Settings"
      />

      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <section className="school-admin-card school-settings-card">
        <div className="school-admin-card__header">
          <h2>Join requests</h2>
          <p>
            Turning this off blocks new join requests. Existing pending requests
            remain available for review.
          </p>
        </div>

        <div className="school-settings-row">
          <div>
            <strong>Allow teachers to request access</strong>
            <span>{allowJoinRequests ? "Enabled" : "Disabled"}</span>
          </div>
          <Button
            isLoading={isSaving}
            onClick={handleToggleJoinRequests}
            variant={allowJoinRequests ? "secondary" : "primary"}
          >
            {allowJoinRequests ? "Turn Off" : "Turn On"}
          </Button>
        </div>
      </section>
    </PageContainer>
  );
}

export default SchoolSettingsPage;
