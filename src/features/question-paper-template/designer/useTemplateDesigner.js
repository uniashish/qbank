import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "../../../hooks/useAuth.js";
import {
  createQuestionPaperTemplate,
  createQuestionPaperTemplateId,
  updateQuestionPaperTemplate,
} from "../services/questionPaperTemplateService.js";
import {
  DEFAULT_TEMPLATE_SETTINGS,
  createQuestionPaperTemplateFields,
  normalizeQuestionPaperTemplate,
} from "../utils/questionPaperTemplate.js";
import { createInitialTemplateSetupValues } from "../setup/templateSetupValidation.js";
import {
  addTemplateSection,
  calculateTemplateSectionsTargetMarks,
  moveTemplateSection,
  removeTemplateSection,
  updateTemplateSection,
} from "../sections/templateSectionUtils.js";

function normalizeText(value, fallback = "Not set") {
  const text = String(value ?? "").trim();

  return text || fallback;
}

function formatDuration(durationMinutes) {
  if (!durationMinutes) {
    return "Not set";
  }

  return `${durationMinutes} min`;
}

function formatMarks(maximumMarks) {
  if (!maximumMarks) {
    return "Not set";
  }

  return `${maximumMarks} mark${maximumMarks === 1 ? "" : "s"}`;
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

export function createInitialTemplateDocument(templateSetup = {}) {
  const defaultSetup = templateSetup.defaultSetup ?? {};
  const examHeading = normalizeText(defaultSetup.examName, "EXAMINATION");

  return {
    content: [
      heading(1, examHeading),
      paragraph(""),
      paragraph("Name: ______________________________"),
      paragraph(""),
      paragraph("Class: _____________________________"),
      paragraph("Date: ______________________________"),
      paragraph(""),
      paragraph("Instructions:"),
      paragraph(""),
      heading(2, "SECTION A"),
    ],
    type: "doc",
  };
}

function createTemplateStatusLabel({
  hasLocalChanges,
  saveStatusState,
  templateId,
}) {
  if (saveStatusState === "saving") {
    return "Saving...";
  }

  if (saveStatusState === "save-failed") {
    return "Save failed";
  }

  if (saveStatusState === "saved") {
    return "Saved Template";
  }

  if (hasLocalChanges) {
    return templateId ? "Unsaved changes" : "Unsaved Template";
  }

  return "Saved Template";
}

function createTemplateSummary({
  designerState,
  hasLocalChanges,
  saveStatusState,
  templateId,
}) {
  const defaultSetup = designerState.setup.defaultSetup ?? {};
  const sectionTargetMarks = calculateTemplateSectionsTargetMarks(
    designerState.sections,
  );
  const defaultMaximumMarks = defaultSetup.maximumMarks;
  const hasSectionTargetMismatch =
    designerState.sections.length > 0 &&
    defaultMaximumMarks != null &&
    sectionTargetMarks !== defaultMaximumMarks;

  return {
    defaultDuration: formatDuration(defaultSetup.durationMinutes),
    defaultExamName: normalizeText(defaultSetup.examName),
    defaultMaximumMarks: formatMarks(defaultSetup.maximumMarks),
    rawDefaultMaximumMarks: defaultMaximumMarks,
    sectionCount: designerState.sections.length,
    sectionTargetMarks,
    sectionTargetWarning: hasSectionTargetMismatch
      ? {
          defaultMaximumMarks,
          sectionTargetMarks,
        }
      : null,
    status: createTemplateStatusLabel({
      hasLocalChanges,
      saveStatusState,
      templateId,
    }),
    templateName: normalizeText(designerState.setup.name, "Untitled template"),
  };
}

function createInitialDesignerState(templateSetup) {
  const setup = createInitialTemplateSetupValues(templateSetup);

  return {
    documentContent: createInitialTemplateDocument(setup),
    sections: [],
    settings: {
      ...DEFAULT_TEMPLATE_SETTINGS,
    },
    setup,
  };
}

function createDesignerStateFromTemplate(template) {
  const normalizedTemplate = normalizeQuestionPaperTemplate(template);

  return {
    documentContent: normalizedTemplate.documentContent,
    sections: normalizedTemplate.sections,
    settings: normalizedTemplate.settings,
    setup: createInitialTemplateSetupValues({
      defaultSetup: normalizedTemplate.defaultSetup,
      description: normalizedTemplate.description,
      name: normalizedTemplate.name,
    }),
  };
}

function createSavePayload(designerState) {
  return createQuestionPaperTemplateFields({
    defaultSetup: designerState.setup.defaultSetup,
    description: designerState.setup.description,
    documentContent: designerState.documentContent,
    name: designerState.setup.name,
    sections: designerState.sections,
    settings: designerState.settings,
    status: "active",
  });
}

function createTemplateFingerprint(designerState) {
  return JSON.stringify(createSavePayload(designerState));
}

function createInitialSaveStatus(template) {
  if (!template?.id) {
    return {
      error: "",
      savedAt: null,
      state: "unsaved",
    };
  }

  return {
    error: "",
    savedAt: getSavedAtDate(template.updatedAt),
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

export function useTemplateDesigner({ initialTemplate, templateSetup } = {}) {
  const { userProfile } = useAuth();
  const [designerState, setDesignerState] = useState(() =>
    initialTemplate
      ? createDesignerStateFromTemplate(initialTemplate)
      : createInitialDesignerState(templateSetup),
  );
  const [templateId, setTemplateId] = useState(initialTemplate?.id ?? "");
  const [saveStatus, setSaveStatus] = useState(() =>
    createInitialSaveStatus(initialTemplate),
  );
  const [lastSavedFingerprint, setLastSavedFingerprint] = useState(() =>
    initialTemplate ? createTemplateFingerprint(designerState) : "",
  );
  const pendingTemplateIdRef = useRef(initialTemplate?.id ?? "");
  const savePromiseRef = useRef(null);
  const templateFingerprint = useMemo(
    () => createTemplateFingerprint(designerState),
    [designerState],
  );
  const hasLocalChanges =
    !templateId || templateFingerprint !== lastSavedFingerprint;
  const summary = useMemo(
    () =>
      createTemplateSummary({
        designerState,
        hasLocalChanges,
        saveStatusState: saveStatus.state,
        templateId,
      }),
    [designerState, hasLocalChanges, saveStatus.state, templateId],
  );
  const hasUnsavedChanges = saveStatus.state !== "saving" && hasLocalChanges;
  const latestFingerprintRef = useRef(templateFingerprint);

  useEffect(() => {
    latestFingerprintRef.current = templateFingerprint;
  }, [templateFingerprint]);

  const commitDesignerState = useCallback((nextDesignerState) => {
    const nextFingerprint = createTemplateFingerprint(nextDesignerState);

    setDesignerState(nextDesignerState);
    setSaveStatus((currentStatus) => {
      if (currentStatus.state === "saving") {
        return currentStatus;
      }

      if (templateId && nextFingerprint === lastSavedFingerprint) {
        return {
          error: "",
          savedAt: currentStatus.savedAt,
          state: "saved",
        };
      }

      return createUnsavedStatus(currentStatus);
    });
  }, [lastSavedFingerprint, templateId]);

  const updateDocumentContent = useCallback((documentContent) => {
    commitDesignerState({
      ...designerState,
      documentContent,
    });
  }, [commitDesignerState, designerState]);

  const addSection = useCallback((section) => {
    commitDesignerState({
      ...designerState,
      sections: addTemplateSection(designerState.sections, section),
    });
  }, [commitDesignerState, designerState]);

  const updateSection = useCallback((sectionId, section) => {
    commitDesignerState({
      ...designerState,
      sections: updateTemplateSection(
        designerState.sections,
        sectionId,
        section,
      ),
    });
  }, [commitDesignerState, designerState]);

  const moveSectionUp = useCallback((sectionId) => {
    commitDesignerState({
      ...designerState,
      sections: moveTemplateSection(designerState.sections, sectionId, -1),
    });
  }, [commitDesignerState, designerState]);

  const moveSectionDown = useCallback((sectionId) => {
    commitDesignerState({
      ...designerState,
      sections: moveTemplateSection(designerState.sections, sectionId, 1),
    });
  }, [commitDesignerState, designerState]);

  const removeSection = useCallback((sectionId) => {
    commitDesignerState({
      ...designerState,
      sections: removeTemplateSection(designerState.sections, sectionId),
    });
  }, [commitDesignerState, designerState]);

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

  const markSaveFailed = useCallback((error) => {
    setSaveStatus((currentStatus) => ({
      error: error?.message ?? "Template could not be saved.",
      savedAt: currentStatus.savedAt,
      state: "save-failed",
    }));
  }, []);

  const saveTemplate = useCallback(async () => {
    if (savePromiseRef.current) {
      return savePromiseRef.current;
    }

    const template = createSavePayload(designerState);
    const fingerprintAtSaveStart = createTemplateFingerprint(designerState);
    const confirmedTemplateId = templateId;
    const targetTemplateId =
      confirmedTemplateId ||
      pendingTemplateIdRef.current ||
      (userProfile?.schoolId
        ? createQuestionPaperTemplateId(userProfile.schoolId)
        : "");

    pendingTemplateIdRef.current = targetTemplateId;
    markSaving();

    const savePromise = (confirmedTemplateId
      ? updateQuestionPaperTemplate({
          template,
          templateId: targetTemplateId,
          userProfile,
        })
      : createQuestionPaperTemplate({
          template,
          templateId: targetTemplateId,
          userProfile,
        })
    )
      .then((savedTemplate) => {
        const savedAt = getSavedAtDate(savedTemplate.updatedAt) ?? new Date();
        const hasNewerLocalChanges =
          latestFingerprintRef.current !== fingerprintAtSaveStart;

        setTemplateId(savedTemplate.id);
        pendingTemplateIdRef.current = savedTemplate.id;

        if (hasNewerLocalChanges) {
          setLastSavedFingerprint(fingerprintAtSaveStart);
          setSaveStatus({
            error: "",
            savedAt,
            state: "unsaved",
          });
        } else {
          markSaved(fingerprintAtSaveStart, savedAt);
        }

        return savedTemplate;
      })
      .catch((error) => {
        markSaveFailed(error);
        throw error;
      })
      .finally(() => {
        savePromiseRef.current = null;
      });

    savePromiseRef.current = savePromise;

    return savePromise;
  }, [
    designerState,
    markSaveFailed,
    markSaved,
    markSaving,
    templateId,
    userProfile,
  ]);

  return {
    addSection,
    designerState,
    hasUnsavedChanges,
    lastSavedFingerprint,
    moveSectionDown,
    moveSectionUp,
    removeSection,
    saveTemplate,
    saveStatus,
    summary,
    templateFingerprint,
    templateId,
    updateSection,
    updateDocumentContent,
  };
}
