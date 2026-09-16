import { useCallback, useMemo, useState } from "react";

import PageContainer from "../../components/layout/PageContainer.jsx";
import QuestionBankToolbar from "../../components/question-bank/QuestionBankToolbar.jsx";
import QuestionList from "../../components/question-bank/QuestionList.jsx";
import QuestionPreviewDialog from "../../components/question-bank/QuestionPreviewDialog.jsx";
import { useQuestionBank } from "../../hooks/useQuestionBank.js";
import { getQuestionById } from "../../services/questionBankService.js";
import ShareQuestionToolbar from "./ShareQuestionToolbar.jsx";
import ShareQuestionsDialog from "./ShareQuestionsDialog.jsx";
import {
  revokeQuestionShares,
  shareQuestions,
} from "./questionSharingService.js";
import { useQuestionSharing } from "./useQuestionSharing.js";

function createShareSuccessMessage(result) {
  if (result.sharedCount === 0 && result.reactivatedCount === 0) {
    return "Selected questions were already shared with those teachers.";
  }

  const parts = [];

  if (result.sharedCount > 0) {
    parts.push(`${result.sharedCount} new share${result.sharedCount === 1 ? "" : "s"}`);
  }

  if (result.reactivatedCount > 0) {
    parts.push(
      `${result.reactivatedCount} reactivated share${
        result.reactivatedCount === 1 ? "" : "s"
      }`,
    );
  }

  return `${parts.join(" and ")} saved.`;
}

function ShareQuestionsPage() {
  const {
    classOptions,
    clearFilters,
    difficultyOptions,
    error,
    filters,
    hasActiveFilters,
    isLoading,
    questionTypeOptions,
    questions,
    schoolId,
    searchTerm,
    setSearchTerm,
    subjectOptions,
    topicOptions,
    totalQuestionCount,
    updateFilter,
  } = useQuestionBank({ ownedOnly: true });
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [feedback, setFeedback] = useState({ message: "", status: "idle" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [revokingTeacherId, setRevokingTeacherId] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const {
    error: sharingError,
    isLoading: isSharingDataLoading,
    refreshSharing,
    shareStateByTeacherId,
    teacherId,
    teachers,
  } = useQuestionSharing({ questionIds: selectedIds });
  const visibleQuestionIds = useMemo(
    () => questions.map((question) => question.id),
    [questions],
  );
  const visibleSelectedCount = useMemo(
    () =>
      visibleQuestionIds.filter((questionId) => selectedIdSet.has(questionId))
        .length,
    [selectedIdSet, visibleQuestionIds],
  );

  const handleViewQuestion = useCallback(
    async (question) => {
      setFeedback({ message: "", status: "idle" });
      setActiveQuestionId(question.id);

      try {
        const freshQuestion = await getQuestionById(schoolId, question.id);

        setPreviewQuestion({
          ...question,
          ...freshQuestion,
        });
      } catch (loadError) {
        console.error("[Question sharing] Failed to load question.", {
          error: loadError,
          questionId: question.id,
          schoolId,
        });

        setFeedback({
          message: loadError?.message || "Question could not be loaded.",
          status: "error",
        });
      } finally {
        setActiveQuestionId("");
      }
    },
    [schoolId],
  );

  const handleSelectAllVisible = useCallback(
    (shouldSelect) => {
      setSelectedIds((currentSelectedIds) => {
        const nextSelectedIds = new Set(currentSelectedIds);

        visibleQuestionIds.forEach((questionId) => {
          if (shouldSelect) {
            nextSelectedIds.add(questionId);
          } else {
            nextSelectedIds.delete(questionId);
          }
        });

        return [...nextSelectedIds];
      });
    },
    [visibleQuestionIds],
  );

  const handleShareQuestions = useCallback(
    async (recipientTeacherIds) => {
      setIsSharing(true);
      setFeedback({ message: "", status: "idle" });

      try {
        const result = await shareQuestions({
          ownerId: teacherId,
          questionIds: selectedIds,
          recipientTeacherIds,
          schoolId,
        });

        await refreshSharing();
        setIsDialogOpen(false);
        setSelectedIds([]);
        setFeedback({
          message: createShareSuccessMessage(result),
          status: "success",
        });
      } finally {
        setIsSharing(false);
      }
    },
    [refreshSharing, schoolId, selectedIds, teacherId],
  );

  const handleRevokeShares = useCallback(
    async (targetTeacherId, shareIds) => {
      setRevokingTeacherId(targetTeacherId);
      setFeedback({ message: "", status: "idle" });

      try {
        const result = await revokeQuestionShares({ schoolId, shareIds });

        await refreshSharing();
        setFeedback({
          message: `${result.revokedCount} share${
            result.revokedCount === 1 ? "" : "s"
          } revoked.`,
          status: "success",
        });
      } finally {
        setRevokingTeacherId("");
      }
    },
    [refreshSharing, schoolId],
  );

  return (
    <PageContainer className="question-bank-page share-questions-page">
      {feedback.status === "success" && (
        <div
          className="teacher-question-bank-feedback teacher-question-bank-feedback--success"
          role="status"
        >
          {feedback.message}
        </div>
      )}

      {feedback.status === "error" && (
        <div
          className="teacher-question-bank-feedback teacher-question-bank-feedback--error"
          role="alert"
        >
          {feedback.message}
        </div>
      )}

      {sharingError && (
        <div
          className="teacher-question-bank-feedback teacher-question-bank-feedback--error"
          role="alert"
        >
          {sharingError}
        </div>
      )}

      <QuestionBankToolbar
        classOptions={classOptions}
        difficultyOptions={difficultyOptions}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onFilterChange={updateFilter}
        onSearchChange={setSearchTerm}
        questionTypeOptions={questionTypeOptions}
        searchTerm={searchTerm}
        subjectOptions={subjectOptions}
        topicOptions={topicOptions}
      />

      <section className="teacher-dashboard-card question-bank-panel">
        <div className="teacher-dashboard-card__header">
          <div>
            <h2>Share Questions</h2>
            <p>
              {totalQuestionCount} active question
              {totalQuestionCount === 1 ? "" : "s"} available to share.
            </p>
          </div>
        </div>

        <ShareQuestionToolbar
          isShareDisabled={isSharingDataLoading || Boolean(sharingError)}
          onClearSelection={() => setSelectedIds([])}
          onSelectAllVisible={handleSelectAllVisible}
          onShareSelected={() => setIsDialogOpen(true)}
          selectedCount={selectedIds.length}
          totalVisibleCount={visibleQuestionIds.length}
          visibleSelectedCount={visibleSelectedCount}
        />

        <div className="question-bank-panel__body">
          <QuestionList
            actionQuestionId={activeQuestionId}
            error={error}
            isLoading={isLoading}
            onSelectionChange={setSelectedIds}
            onView={handleViewQuestion}
            questions={questions}
            selectedIds={selectedIds}
            selectionMode
            totalQuestionCount={totalQuestionCount}
          />
        </div>
      </section>

      <QuestionPreviewDialog
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />

      {isDialogOpen && (
        <ShareQuestionsDialog
          isOpen
          isSharing={isSharing}
          onClose={() => {
            if (!isSharing && !revokingTeacherId) {
              setIsDialogOpen(false);
            }
          }}
          onRevokeShares={handleRevokeShares}
          onShare={handleShareQuestions}
          revokingTeacherId={revokingTeacherId}
          selectedQuestionCount={selectedIds.length}
          shareStateByTeacherId={shareStateByTeacherId}
          teachers={teachers}
        />
      )}
    </PageContainer>
  );
}

export default ShareQuestionsPage;
