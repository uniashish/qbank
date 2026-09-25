import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import AnswerKeyPreview from "../answer-key/AnswerKeyPreview.jsx";
import {
  DEFAULT_ANSWER_KEY_OPTIONS,
  generateAnswerKeyModel,
} from "../answer-key/answerKeyGenerator.js";
import { useQuestionPaperAutosave } from "../hooks/useQuestionPaperAutosave.js";
import {
  createQuestionBlockFromQuestion,
  createQuestionBlockNode,
} from "../nodes/questionBlockUtils.js";
import {
  createHorizontalRuleNode,
  insertAtPaperInsertionPoint,
} from "../editor-elements/paperInsertUtils.js";
import QuestionPickerDialog from "../picker/QuestionPickerDialog.jsx";
import {
  createQuestionPaperDraft,
  createQuestionPaperDraftId,
  finalizeQuestionPaperDraft,
  updateQuestionPaperDraft,
} from "../services/questionPaperService.js";
import FinalizePaperButton from "../finalize/FinalizePaperButton.jsx";
import PaperCanvas from "./PaperCanvas.jsx";
import PaperDesignerHeader from "./PaperDesignerHeader.jsx";
import PaperSummary from "./PaperSummary.jsx";
import { useQuestionPaperDesigner } from "./useQuestionPaperDesigner.js";

const FINAL_STATUS = "final";

function QuestionPaperDesigner({ initialDraft }) {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [editor, setEditor] = useState(null);
  const [answerKeyOptions, setAnswerKeyOptions] = useState(
    DEFAULT_ANSWER_KEY_OPTIONS,
  );
  const [isAnswerKeyOpen, setIsAnswerKeyOpen] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isQuestionPickerOpen, setIsQuestionPickerOpen] = useState(false);
  const [isAutosaveEnabled, setIsAutosaveEnabled] = useState(
    Boolean(initialDraft?.paperId) && initialDraft?.paper?.status !== FINAL_STATUS,
  );
  const {
    designerState,
    draftFingerprint,
    lastSavedFingerprint,
    markFinalized,
    markSaveFailed,
    markSaved,
    markSaving,
    markUnsaved,
    paperId,
    saveStatus,
    setPaperId,
    summary,
    updateDocumentContent,
  } = useQuestionPaperDesigner(initialDraft);
  const latestDraftRef = useRef({
    designerState,
    draftFingerprint,
    paperId,
    userProfile,
  });
  const isMountedRef = useRef(true);
  const pendingInsertionPointRef = useRef(null);
  const pendingPaperIdRef = useRef(paperId);
  const savePromiseRef = useRef(null);
  const isReadOnly = designerState.status === FINAL_STATUS;
  const canShowFinalize =
    !isReadOnly &&
    Boolean(paperId) &&
    saveStatus.state === "saved" &&
    draftFingerprint === lastSavedFingerprint;
  const canShowAnswerKey = Boolean(paperId);
  const answerKey = useMemo(
    () =>
      generateAnswerKeyModel({
        documentContent: designerState.documentContent,
        questionBlocks: designerState.questions,
      }),
    [designerState.documentContent, designerState.questions],
  );
  const alreadyAddedQuestionIds = useMemo(
    () =>
      designerState.questions
        .map((questionBlock) => questionBlock.questionId)
      .filter(Boolean),
    [designerState.questions],
  );

  useEffect(() => {
    latestDraftRef.current = {
      designerState,
      draftFingerprint,
      paperId,
      userProfile,
    };
  }, [designerState, draftFingerprint, paperId, userProfile]);

  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    [],
  );

  const persistDraft = useCallback(
    async ({ source }) => {
      if (savePromiseRef.current) {
        return savePromiseRef.current;
      }

      const draftSnapshot = latestDraftRef.current;

      if (draftSnapshot.designerState?.status === FINAL_STATUS) {
        const error = new Error("Finalized papers cannot be edited.");

        markSaveFailed(error);
        throw error;
      }

      const confirmedPaperId = draftSnapshot.paperId;
      const pendingPaperId = pendingPaperIdRef.current;
      const shouldCreateDraft = !confirmedPaperId && !pendingPaperId;
      let targetPaperId;

      try {
        targetPaperId =
          confirmedPaperId ||
          pendingPaperId ||
          createQuestionPaperDraftId(draftSnapshot.userProfile?.schoolId);
      } catch (error) {
        markSaveFailed(error);
        throw error;
      }

      const fingerprintAtSaveStart = draftSnapshot.draftFingerprint;

      pendingPaperIdRef.current = targetPaperId;
      markSaving();

      const savePromise = (async () => {
        const savedPaper = shouldCreateDraft
          ? await createQuestionPaperDraft({
              designerState: draftSnapshot.designerState,
              paperId: targetPaperId,
              userProfile: draftSnapshot.userProfile,
            })
          : await updateQuestionPaperDraft({
              designerState: draftSnapshot.designerState,
              paperId: targetPaperId,
              userProfile: draftSnapshot.userProfile,
            });

        if (!isMountedRef.current) {
          return savedPaper;
        }

        setPaperId(savedPaper.id);
        setIsAutosaveEnabled(true);

        const latestFingerprint = latestDraftRef.current.draftFingerprint;

        if (latestFingerprint === fingerprintAtSaveStart) {
          markSaved(fingerprintAtSaveStart, savedPaper.updatedAt);
        } else {
          markSaved(fingerprintAtSaveStart, savedPaper.updatedAt);
          markUnsaved();
        }

        if (!confirmedPaperId && source === "manual") {
          navigate(`/teacher/exam-papers/${savedPaper.id}/edit`, {
            replace: true,
          });
        }

        return savedPaper;
      })()
        .catch((error) => {
          console.error("[Question paper] Failed to save draft.", {
            error,
            paperId: targetPaperId,
            source,
          });

          if (!confirmedPaperId) {
            pendingPaperIdRef.current = "";
          }

          if (isMountedRef.current) {
            markSaveFailed(error);
          }

          throw error;
        })
        .finally(() => {
          savePromiseRef.current = null;
        });

      savePromiseRef.current = savePromise;

      return savePromise;
    },
    [markSaveFailed, markSaved, markSaving, markUnsaved, navigate, setPaperId],
  );

  const handleSaveDraft = useCallback(() => {
    persistDraft({ source: "manual" }).catch(() => {});
  }, [persistDraft]);

  useQuestionPaperAutosave({
    draftFingerprint,
    enabled: !isReadOnly && isAutosaveEnabled && Boolean(paperId),
    isSaving: saveStatus.state === "saving",
    lastSavedFingerprint,
    onAutosave: () => persistDraft({ source: "autosave" }).catch(() => {}),
    saveStatusState: saveStatus.state,
  });

  const handleFinalizePaper = useCallback(async () => {
    if (!paperId || isReadOnly || isFinalizing) {
      return;
    }

    setIsFinalizing(true);

    try {
      const finalizedPaper = await finalizeQuestionPaperDraft({
        paperId,
        userProfile,
      });

      setIsAutosaveEnabled(false);
      markFinalized(finalizedPaper.finalizedAt);
    } finally {
      if (isMountedRef.current) {
        setIsFinalizing(false);
      }
    }
  }, [isFinalizing, isReadOnly, markFinalized, paperId, userProfile]);

  const handleAddQuestions = useCallback(
    (questions) => {
      if (isReadOnly || !editor || questions.length === 0) {
        return;
      }

      const alreadyAddedQuestionIdSet = new Set(alreadyAddedQuestionIds);
      const nextQuestions = questions.filter(
        (question) => question?.id && !alreadyAddedQuestionIdSet.has(question.id),
      );

      if (nextQuestions.length === 0) {
        pendingInsertionPointRef.current = null;
        setIsQuestionPickerOpen(false);
        return;
      }

      const questionNodes = nextQuestions.map((question, index) =>
        createQuestionBlockNode(
          createQuestionBlockFromQuestion(
            question,
            String(designerState.questions.length + index + 1),
          ),
        ),
      );

      insertAtPaperInsertionPoint({
        content: questionNodes,
        editor,
        insertionPoint: pendingInsertionPointRef.current,
      });
      pendingInsertionPointRef.current = null;
      setIsQuestionPickerOpen(false);
    },
    [alreadyAddedQuestionIds, designerState.questions.length, editor, isReadOnly],
  );

  const handleOpenQuestionPicker = useCallback((insertionPoint) => {
    if (isReadOnly || !editor) {
      return;
    }

    pendingInsertionPointRef.current = insertionPoint;
    setIsQuestionPickerOpen(true);
  }, [editor, isReadOnly]);

  const handleInsertDivider = useCallback(
    (insertionPoint) => {
      if (isReadOnly || !editor) {
        return;
      }

      insertAtPaperInsertionPoint({
        content: createHorizontalRuleNode(),
        editor,
        insertionPoint,
      });
    },
    [editor, isReadOnly],
  );

  return (
    <PageContainer className="question-papers-page paper-designer-page">
      <PaperDesignerHeader
        answerKeyAction={
          canShowAnswerKey ? (
            <Button
              onClick={() => setIsAnswerKeyOpen(true)}
              type="button"
              variant="secondary"
            >
              <Icon name="fileText" size={18} />
              <span>Answer Key</span>
            </Button>
          ) : null
        }
        finalizeAction={
          canShowFinalize ? (
            <FinalizePaperButton
              designerState={designerState}
              isFinalizing={isFinalizing}
              onFinalize={handleFinalizePaper}
              paperId={paperId}
              summary={summary}
            />
          ) : null
        }
        isReadOnly={isReadOnly}
        onBack={() => {
          if (paperId) {
            navigate("/teacher/exam-papers");
            return;
          }

          navigate("/teacher/exam-papers/new", {
            state: {
              paperSetup: designerState.setup,
            },
          });
        }}
        isSaving={saveStatus.state === "saving"}
        onSaveDraft={handleSaveDraft}
        saveStatus={saveStatus}
        title={summary.title}
      />

      <div className="paper-designer-layout">
        <PaperCanvas
          documentContent={designerState.documentContent}
          editor={editor}
          onDocumentChange={updateDocumentContent}
          onEditorReady={setEditor}
          onInsertDivider={handleInsertDivider}
          onOpenQuestionPicker={handleOpenQuestionPicker}
          readOnly={isReadOnly}
        />
        <PaperSummary summary={summary} />
      </div>

      {!isReadOnly && isQuestionPickerOpen && (
        <QuestionPickerDialog
          alreadyAddedQuestionIds={alreadyAddedQuestionIds}
          isOpen={isQuestionPickerOpen}
          onAddQuestions={handleAddQuestions}
          onClose={() => {
            pendingInsertionPointRef.current = null;
            setIsQuestionPickerOpen(false);
          }}
        />
      )}

      <AnswerKeyPreview
        answerKey={answerKey}
        isOpen={isAnswerKeyOpen}
        onClose={() => setIsAnswerKeyOpen(false)}
        onOptionsChange={setAnswerKeyOptions}
        options={answerKeyOptions}
      />
    </PageContainer>
  );
}

export default QuestionPaperDesigner;
