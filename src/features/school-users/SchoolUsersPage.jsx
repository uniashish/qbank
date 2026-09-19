import { useMemo, useState } from "react";

import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import ChangeRoleDialog from "./ChangeRoleDialog.jsx";
import JoinRequestsList from "./JoinRequestsList.jsx";
import ReviewJoinRequestDialog from "./ReviewJoinRequestDialog.jsx";
import SchoolAdminsList from "./SchoolAdminsList.jsx";
import TeachersList from "./TeachersList.jsx";
import UserDetailsDialog from "./UserDetailsDialog.jsx";
import UserTabs from "./UserTabs.jsx";
import {
  approveJoinRequest,
  changeSchoolUserRole,
  rejectJoinRequest,
} from "./schoolUsersService.js";
import { useSchoolUsers } from "./useSchoolUsers.js";

function SchoolUsersPage() {
  const {
    assignmentGroups,
    currentUserId,
    isLoading,
    joinRequests,
    pageError,
    refresh,
    schoolAdmins,
    schoolId,
    teachers,
  } = useSchoolUsers();
  const [activeTab, setActiveTab] = useState("joinRequests");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState({ action: "", userId: "" });
  const [roleChange, setRoleChange] = useState(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [viewUser, setViewUser] = useState(null);

  const counts = useMemo(
    () => ({
      joinRequests: joinRequests.length,
      schoolAdmins: schoolAdmins.length,
      teachers: teachers.length,
    }),
    [joinRequests.length, schoolAdmins.length, teachers.length],
  );

  const handleApproveJoinRequest = async (request, assignments) => {
    if (!request?.userId || reviewAction.userId) {
      return;
    }

    setReviewAction({ action: "approve", userId: request.userId });
    setFeedback({ message: "", type: "" });

    try {
      await approveJoinRequest({
        assignments,
        reviewedBy: currentUserId,
        schoolId,
        userId: request.userId,
      });
      await refresh();
      setReviewRequest(null);
      setActiveTab("teachers");
      setFeedback({ message: "Join request approved.", type: "success" });
    } catch (error) {
      console.error("[School users] Failed to approve join request.", {
        error,
        schoolId,
        userId: request.userId,
      });
      setFeedback({
        message: error?.message || "The join request could not be approved.",
        type: "error",
      });
    } finally {
      setReviewAction({ action: "", userId: "" });
    }
  };

  const handleRejectJoinRequest = async (request) => {
    if (!request?.userId || reviewAction.userId) {
      return;
    }

    setReviewAction({ action: "reject", userId: request.userId });
    setFeedback({ message: "", type: "" });

    try {
      await rejectJoinRequest({
        reviewedBy: currentUserId,
        schoolId,
        userId: request.userId,
      });
      await refresh();
      setReviewRequest(null);
      setFeedback({ message: "Join request rejected.", type: "success" });
    } catch (error) {
      console.error("[School users] Failed to reject join request.", {
        error,
        schoolId,
        userId: request.userId,
      });
      setFeedback({
        message: error?.message || "The join request could not be rejected.",
        type: "error",
      });
    } finally {
      setReviewAction({ action: "", userId: "" });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!roleChange || isChangingRole) {
      return;
    }

    setIsChangingRole(true);
    setFeedback({ message: "", type: "" });

    try {
      await changeSchoolUserRole({
        actorUid: currentUserId,
        nextRole: roleChange.nextRole,
        schoolId,
        userId: roleChange.user.uid,
      });
      await refresh();
      setRoleChange(null);
      setFeedback({ message: "User role updated.", type: "success" });
    } catch (error) {
      console.error("[School users] Failed to change role.", {
        error,
        nextRole: roleChange.nextRole,
        schoolId,
        userId: roleChange.user.uid,
      });
      setFeedback({
        message: error?.message || "The role change could not be saved.",
        type: "error",
      });
    } finally {
      setIsChangingRole(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading users" />
          <p>Loading users...</p>
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
        description="Review access requests and manage active school users."
        schoolName="School Workspace"
        title="Users"
      />

      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <UserTabs activeTab={activeTab} counts={counts} onChange={setActiveTab} />

      {activeTab === "joinRequests" && (
        <JoinRequestsList
          onReview={setReviewRequest}
          requests={joinRequests}
        />
      )}

      {activeTab === "teachers" && (
        <TeachersList
          onChangeRole={(user, nextRole) => setRoleChange({ nextRole, user })}
          onView={setViewUser}
          teachers={teachers}
        />
      )}

      {activeTab === "schoolAdmins" && (
        <SchoolAdminsList
          currentUserId={currentUserId}
          onChangeRole={(user, nextRole) => setRoleChange({ nextRole, user })}
          onView={setViewUser}
          schoolAdmins={schoolAdmins}
        />
      )}

      {reviewRequest && (
        <ReviewJoinRequestDialog
          assignmentGroups={assignmentGroups}
          isApproving={
            reviewAction.action === "approve" &&
            reviewAction.userId === reviewRequest.userId
          }
          isRejecting={
            reviewAction.action === "reject" &&
            reviewAction.userId === reviewRequest.userId
          }
          onApprove={handleApproveJoinRequest}
          onClose={() => setReviewRequest(null)}
          onReject={handleRejectJoinRequest}
          request={reviewRequest}
        />
      )}

      {roleChange && (
        <ChangeRoleDialog
          isSaving={isChangingRole}
          nextRole={roleChange.nextRole}
          onClose={() => setRoleChange(null)}
          onConfirm={handleConfirmRoleChange}
          user={roleChange.user}
        />
      )}

      {viewUser && (
        <UserDetailsDialog
          onClose={() => setViewUser(null)}
          user={viewUser}
        />
      )}
    </PageContainer>
  );
}

export default SchoolUsersPage;
