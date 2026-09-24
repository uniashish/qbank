import { useCallback, useMemo, useState } from "react";

import {
  extractQuestionBlocksFromDocument,
  renumberQuestionBlocks,
} from "../nodes/questionBlockUtils.js";
import {
  createEmptyQuestionPaperDocument,
  createQuestionPaperDesignerStateFromDraft,
  createQuestionPaperDraftFingerprint,
} from "../utils/questionPaperDraft.js";
import { calculateQuestionPaperSummary } from "../utils/questionPaperSummary.js";

const FINAL_STATUS = "final";

function createInitialDesignerState(setup) {
  const documentContent = createEmptyQuestionPaperDocument();

  return {
    documentContent,
    questions: extractQuestionBlocksFromDocument(documentContent),
    setup,
    status: "draft",
  };
}

function getSavedAtDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value.toDate === "function") {
    return value.toDate();
  }

  return value instanceof Date ? value : null;
}

function createDesignerInitialState(initialDraft) {
  if (initialDraft?.paper) {
    return createQuestionPaperDesignerStateFromDraft({
      assignmentState: initialDraft.assignmentState,
      paper: initialDraft.paper,
    });
  }

  return createInitialDesignerState(initialDraft?.setup ?? initialDraft);
}

function createInitialSaveStatus(initialDraft) {
  if (!initialDraft?.paperId) {
    return {
      error: "",
      savedAt: null,
      state: "unsaved",
    };
  }

  return {
    error: "",
    savedAt: getSavedAtDate(initialDraft.updatedAt),
    state: "saved",
  };
}

function createUnsavedStatus(currentStatus) {
  if (currentStatus.state === "saving") {
    return currentStatus;
  }

  return {
    error: "",
    savedAt: currentStatus.savedAt,
    state: "unsaved",
  };
}

export function useQuestionPaperDesigner(initialDraft) {
  const [designerState, setDesignerState] = useState(() =>
    createDesignerInitialState(initialDraft),
  );
  const [paperId, setPaperId] = useState(initialDraft?.paperId ?? "");
  const [saveStatus, setSaveStatus] = useState(() =>
    createInitialSaveStatus(initialDraft),
  );
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() =>
    initialDraft?.paperId
      ? createQuestionPaperDraftFingerprint(designerState)
      : "",
  );

  const summary = useMemo(
    () =>
      calculateQuestionPaperSummary({
        questionBlocks: designerState.questions,
        setup: designerState.setup,
        status: designerState.status,
      }),
    [designerState.questions, designerState.setup, designerState.status],
  );
  const draftFingerprint = useMemo(
    () => createQuestionPaperDraftFingerprint(designerState),
    [designerState],
  );

  const updateDocumentContent = useCallback((documentContent) => {
    if (designerState.status === FINAL_STATUS) {
      return;
    }

    const renumberedResult = renumberQuestionBlocks(documentContent);

    setDesignerState((currentState) => ({
      ...currentState,
      documentContent: renumberedResult.documentContent,
      questions: renumberedResult.questionBlocks,
    }));
    setSaveStatus(createUnsavedStatus);
  }, [designerState.status]);

  const markSaving = useCallback(() => {
    setSaveStatus({
      error: "",
      savedAt: null,
      state: "saving",
    });
  }, []);

  const markSaved = useCallback((fingerprint, savedAt = new Date()) => {
    setLastSavedFingerprint(fingerprint);
    setSaveStatus({
      error: "",
      savedAt,
      state: "saved",
    });
  }, []);

  const markUnsaved = useCallback(() => {
    setSaveStatus(createUnsavedStatus);
  }, []);

  const markSaveFailed = useCallback((error) => {
    setSaveStatus((currentStatus) => ({
      error: error?.message ?? "Draft could not be saved.",
      savedAt: currentStatus.savedAt,
      state: "save-failed",
    }));
  }, []);

  const markFinalized = useCallback((finalizedAt = new Date()) => {
    setDesignerState((currentState) => ({
      ...currentState,
      status: FINAL_STATUS,
    }));
    setSaveStatus({
      error: "",
      savedAt: finalizedAt,
      state: "saved",
    });
  }, []);

  return {
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
  };
}
