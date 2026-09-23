import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import PageContainer from "../../../components/layout/PageContainer.jsx";
import TemplateSectionList from "../sections/TemplateSectionList.jsx";
import TemplateCanvas from "./TemplateCanvas.jsx";
import TemplateDesignerHeader from "./TemplateDesignerHeader.jsx";
import TemplateSummary from "./TemplateSummary.jsx";
import { useTemplateDesigner } from "./useTemplateDesigner.js";

function TemplateDesigner({ initialDraft }) {
  const navigate = useNavigate();
  const {
    addSection,
    designerState,
    hasUnsavedChanges,
    moveSectionDown,
    moveSectionUp,
    removeSection,
    saveStatus,
    saveTemplate,
    summary,
    templateId,
    updateSection,
    updateDocumentContent,
  } = useTemplateDesigner(initialDraft);

  useEffect(() => {
    if (!hasUnsavedChanges) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleBack = useCallback(() => {
    if (
      hasUnsavedChanges &&
      !window.confirm("Discard unsaved template changes?")
    ) {
      return;
    }

    if (templateId) {
      navigate("/teacher/exam-papers/templates");
      return;
    }

    navigate("/teacher/exam-papers/templates/new", {
      state: {
        templateSetup: designerState.setup,
      },
    });
  }, [designerState.setup, hasUnsavedChanges, navigate, templateId]);

  const handleSaveTemplate = useCallback(() => {
    saveTemplate()
      .then((savedTemplate) => {
        if (!templateId && savedTemplate?.id) {
          navigate(`/teacher/exam-papers/templates/${savedTemplate.id}/edit`, {
            replace: true,
          });
        }
      })
      .catch((error) => {
        console.error("[Question paper template] Failed to save template.", {
          error,
          templateId: templateId || "new",
        });
      });
  }, [navigate, saveTemplate, templateId]);

  return (
    <PageContainer className="question-paper-template-page template-designer-page paper-designer-page">
      <TemplateDesignerHeader
        canSave={hasUnsavedChanges}
        isSaving={saveStatus.state === "saving"}
        onBack={handleBack}
        onSaveTemplate={handleSaveTemplate}
        saveStatus={saveStatus}
        title={summary.templateName}
      />

      {saveStatus.state === "save-failed" && (
        <div
          className="question-paper-template-feedback question-paper-template-feedback--error"
          role="alert"
        >
          {saveStatus.error || "Question paper template could not be saved."}
        </div>
      )}

      <div className="paper-designer-layout template-designer-layout">
        <TemplateCanvas
          documentContent={designerState.documentContent}
          onDocumentChange={updateDocumentContent}
        />
        <div className="template-designer-sidebar">
          <TemplateSectionList
            onAddSection={addSection}
            onMoveSectionDown={moveSectionDown}
            onMoveSectionUp={moveSectionUp}
            onRemoveSection={removeSection}
            onUpdateSection={updateSection}
            sections={designerState.sections}
          />
          <TemplateSummary summary={summary} />
        </div>
      </div>
    </PageContainer>
  );
}

export default TemplateDesigner;
