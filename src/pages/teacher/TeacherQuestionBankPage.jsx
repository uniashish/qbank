import { useCallback, useRef, useState } from "react";

import DeleteQuestionDialog from "../../components/question-bank/DeleteQuestionDialog.jsx";
import QuestionBankToolbar from "../../components/question-bank/QuestionBankToolbar.jsx";
import QuestionList from "../../components/question-bank/QuestionList.jsx";
import QuestionPreviewDialog from "../../components/question-bank/QuestionPreviewDialog.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import QuestionDesigner from "../../features/question-designer/components/QuestionDesigner.jsx";
import { saveQuestion } from "../../features/question-designer/persistence/saveQuestion.js";
import { removeSharedQuestion } from "../../features/question-sharing/questionSharingService.js";
import { useAuth } from "../../hooks/useAuth.js";
import { useQuestionBank } from "../../hooks/useQuestionBank.js";
import {
  getQuestionById,
  softDeleteQuestion,
  updateQuestion,
} from "../../services/questionBankService.js";

const INITIAL_SAVE_STATE = {
  message: "",
  status: "idle",
};

function TeacherQuestionBankPage() {
  const { userProfile } = useAuth();
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
    refreshQuestions,
    schoolId,
    searchTerm,
    setSearchTerm,
    subjectOptions,
    topicOptions,
    totalQuestionCount,
    updateFilter,
  } = useQuestionBank();
  const [actionError, setActionError] = useState("");
  const [activeQuestionId, setActiveQuestionId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteQuestion, setDeleteQuestion] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isDeleteInFlight, setIsDeleteInFlight] = useState(false);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [saveState, setSaveState] = useState(INITIAL_SAVE_STATE);
  const saveInFlightRef = useRef(false);
  const isSaving = saveState.status === "saving";
  const designerMode = editingQuestion ? "edit" : "create";

  const loadFreshQuestion = useCallback(
    async (questionId) => {
      setActionError("");
      setActiveQuestionId(questionId);

      try {
        return await getQuestionById(schoolId, questionId);
      } catch (loadError) {
        console.error("[Question bank] Failed to load question.", {
          error: loadError,
          questionId,
          schoolId,
        });

        setActionError(loadError?.message || "Question could not be loaded.");
        return null;
      } finally {
        setActiveQuestionId("");
      }
    },
    [schoolId],
  );

  const handleOpenDesigner = useCallback(() => {
    setEditingQuestion(null);
    setSaveState(INITIAL_SAVE_STATE);
    setIsDesignerOpen(true);
  }, []);

  const handleCloseDesigner = useCallback(() => {
    if (saveInFlightRef.current) {
      return;
    }

    setIsDesignerOpen(false);
    setEditingQuestion(null);
  }, []);

  const handleViewQuestion = useCallback(
    async (question) => {
      const freshQuestion = await loadFreshQuestion(question.id);

      if (freshQuestion) {
        setPreviewQuestion({
          ...question,
          ...freshQuestion,
        });
      }
    },
    [loadFreshQuestion],
  );

  const handleEditQuestion = useCallback(
    async (question) => {
      if (question.access?.canEdit === false) {
        setActionError("Shared questions cannot be edited.");
        return;
      }

      const freshQuestion = await loadFreshQuestion(question.id);

      if (freshQuestion) {
        setEditingQuestion({
          ...question,
          ...freshQuestion,
        });
        setSaveState(INITIAL_SAVE_STATE);
        setIsDesignerOpen(true);
      }
    },
    [loadFreshQuestion],
  );

  const handleDeleteQuestion = useCallback((question) => {
    if (question.access?.canDelete === false) {
      setActionError("Shared questions cannot be deleted.");
      return;
    }

    setDeleteError("");
    setDeleteQuestion(question);
  }, []);

  const handleRemoveSharedQuestion = useCallback(
    async (question) => {
      const shareId = question.shareInfo?.shareId;

      if (!shareId) {
        setActionError("This shared question could not be removed.");
        return;
      }

      setActionError("");
      setActiveQuestionId(question.id);

      try {
        await removeSharedQuestion({ schoolId, shareId });
        await refreshQuestions();
        setSaveState({
          message: "Shared question removed.",
          status: "success",
        });
      } catch (removeError) {
        console.error("[Question bank] Failed to remove shared question.", {
          error: removeError,
          questionId: question.id,
          schoolId,
          shareId,
        });

        setActionError(
          removeError?.message || "Shared question could not be removed.",
        );
      } finally {
        setActiveQuestionId("");
      }
    },
    [refreshQuestions, schoolId],
  );

  const handleCancelDelete = useCallback(() => {
    if (isDeleteInFlight) {
      return;
    }

    setDeleteError("");
    setDeleteQuestion(null);
  }, [isDeleteInFlight]);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteQuestion || isDeleteInFlight) {
      return;
    }

    setDeleteError("");
    setIsDeleteInFlight(true);

    try {
      await softDeleteQuestion(schoolId, deleteQuestion.id);
      await refreshQuestions();
      setDeleteQuestion(null);
      setSaveState({
        message: "Question deleted.",
        status: "success",
      });
    } catch (deleteQuestionError) {
      console.error("[Question bank] Failed to delete question.", {
        error: deleteQuestionError,
        questionId: deleteQuestion.id,
        schoolId,
      });

      setDeleteError(
        deleteQuestionError?.message || "Question could not be deleted.",
      );
    } finally {
      setIsDeleteInFlight(false);
    }
  }, [deleteQuestion, isDeleteInFlight, refreshQuestions, schoolId]);

  const handleSaveQuestion = useCallback(
    async (questionDraft) => {
      if (saveInFlightRef.current) {
        return;
      }

      saveInFlightRef.current = true;
      setSaveState({
        message: "Saving question...",
        status: "saving",
      });

      try {
        if (editingQuestion) {
          await updateQuestion({
            draft: questionDraft,
            existingQuestion: editingQuestion,
            questionId: editingQuestion.id,
            schoolId: userProfile.schoolId,
            teacherProfile: userProfile,
          });
        } else {
          await saveQuestion({
            draft: questionDraft,
            teacherProfile: userProfile,
          });
        }

        await refreshQuestions();
        setEditingQuestion(null);
        setIsDesignerOpen(false);
        setSaveState({
          message: editingQuestion ? "Question updated." : "Question saved.",
          status: "success",
        });
      } catch (saveError) {
        console.error("[Question bank] Failed to save question.", {
          error: saveError,
        });

        setSaveState({
          message: saveError?.message || "Question could not be saved.",
          status: "error",
        });
      } finally {
        saveInFlightRef.current = false;
      }
    },
    [editingQuestion, refreshQuestions, userProfile],
  );

  return (
    <PageContainer className="question-bank-page">
      {saveState.status === "success" && (
        <div
          className="teacher-question-bank-feedback teacher-question-bank-feedback--success"
          role="status"
        >
          {saveState.message}
        </div>
      )}

      {actionError && (
        <div
          className="teacher-question-bank-feedback teacher-question-bank-feedback--error"
          role="alert"
        >
          {actionError}
        </div>
      )}

      <QuestionBankToolbar
        classOptions={classOptions}
        difficultyOptions={difficultyOptions}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onAddQuestion={handleOpenDesigner}
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
            <h2>Questions</h2>
            <p>
              {totalQuestionCount} active question
              {totalQuestionCount === 1 ? "" : "s"} in your bank.
            </p>
          </div>
        </div>

        <div className="question-bank-panel__body">
          <QuestionList
            actionQuestionId={activeQuestionId}
            error={error}
            isLoading={isLoading}
            onDelete={handleDeleteQuestion}
            onEdit={handleEditQuestion}
            onRemove={handleRemoveSharedQuestion}
            onView={handleViewQuestion}
            questions={questions}
            totalQuestionCount={totalQuestionCount}
          />
        </div>
      </section>

      <QuestionPreviewDialog
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />

      <DeleteQuestionDialog
        error={deleteError}
        isDeleting={isDeleteInFlight}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        question={deleteQuestion}
      />

      <QuestionDesigner
        initialQuestion={editingQuestion}
        isOpen={isDesignerOpen}
        isSaving={isSaving}
        mode={designerMode}
        onClose={handleCloseDesigner}
        onSave={handleSaveQuestion}
        saveError={saveState.status === "error" ? saveState.message : ""}
      />
    </PageContainer>
  );
}

export default TeacherQuestionBankPage;
