import { useCallback, useMemo, useState } from "react";

import {
  extractQuestionBlocksFromDocument,
  renumberQuestionBlocks,
} from "../nodes/questionBlockUtils.js";
import {
  createQuestionPaperDesignerStateFromDraft,
  createQuestionPaperDraftFingerprint,
} from "../utils/questionPaperDraft.js";
import { calculateQuestionPaperSummary } from "../utils/questionPaperSummary.js";

const FINAL_STATUS = "final";

function getDisplayValue(value, fallback = "Not set") {
  if (value == null || value === "") {
    return fallback;
  }

  return String(value);
}

function textNode(text) {
  return {
    text: String(text),
    type: "text",
  };
}

function paragraph(text = "") {
  if (!text) {
    return { type: "paragraph" };
  }

  return {
    content: [textNode(text)],
    type: "paragraph",
  };
}

function heading(level, text) {
  return {
    attrs: { level },
    content: [textNode(text)],
    type: "heading",
  };
}

function setupLine(label, value) {
  return paragraph(`${label}: ${getDisplayValue(value)}`);
}

export function createInitialQuestionPaperDocument(setup) {
  const classLabel = setup.className || setup.classId;
  const subjectLabel = setup.subjectName || setup.subjectId;

  return {
    content: [
      paragraph("School / paper heading area"),
      heading(1, setup.title || "Untitled Paper"),
      paragraph(getDisplayValue(setup.examName, "Exam Name")),
      paragraph(""),
      setupLine("Class", classLabel),
      setupLine("Subject", subjectLabel),
      setupLine("Term", setup.term),
      setupLine("Academic Year", setup.academicYear),
      paragraph(""),
      setupLine("Duration", setup.durationMinutes ? `${setup.durationMinutes} minutes` : ""),
      setupLine("Maximum Marks", setup.maximumMarks),
      paragraph(""),
      heading(2, "Instructions"),
      paragraph("Write exam instructions here."),
      paragraph(""),
      heading(2, "Questions"),
      paragraph("Questions will be added in a later phase."),
    ],
    type: "doc",
  };
}

function createInitialDesignerState(setup) {
  const documentContent = createInitialQuestionPaperDocument(setup);

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
