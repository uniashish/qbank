import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import Icon from "../../../components/common/Icon.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import TemplateDesigner from "../designer/TemplateDesigner.jsx";
import {
  QUESTION_PAPER_TEMPLATE_ERROR_CODES,
  getQuestionPaperTemplate,
} from "../services/questionPaperTemplateService.js";

const ARCHIVED_STATUS = "archived";

function TemplateDesignerLoadState({
  children,
  indicator,
  isError = false,
  title,
}) {
  return (
    <PageContainer className="question-paper-template-page question-paper-template-setup-page">
      <section
        className={[
          "teacher-dashboard-card",
          "question-paper-template-panel",
          "question-paper-template-designer-state",
          isError ? "question-paper-template-designer-state--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {indicator}
        <div>
          <h2>{title}</h2>
          {children}
        </div>
      </section>
    </PageContainer>
  );
}

function NewTemplateDesignerPage() {
  const location = useLocation();
  const templateSetup = location.state?.templateSetup;
  const initialDraft = useMemo(() => ({ templateSetup }), [templateSetup]);

  if (!templateSetup) {
    return <Navigate replace to="/teacher/exam-papers/templates/new" />;
  }

  return <TemplateDesigner initialDraft={initialDraft} />;
}

function LoadedTemplateDesignerPage({ template }) {
  const initialDraft = useMemo(
    () => ({
      initialTemplate: template,
    }),
    [template],
  );

  return <TemplateDesigner initialDraft={initialDraft} />;
}

function EditTemplateDesignerPage({ templateId }) {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const requestKey =
    !isAuthLoading && userProfile?.schoolId && userProfile?.uid
      ? `${userProfile.schoolId}:${userProfile.uid}:${templateId}`
      : "";
  const [loadState, setLoadState] = useState({
    error: "",
    requestKey: "",
    status: "loading",
    template: null,
  });

  useEffect(() => {
    let isMounted = true;

    if (isAuthLoading || !requestKey) {
      return undefined;
    }

    getQuestionPaperTemplate({ templateId, userProfile })
      .then((template) => {
        if (!isMounted) {
          return;
        }

        if (!template) {
          setLoadState({
            error: "",
            requestKey,
            status: "not-found",
            template: null,
          });
          return;
        }

        if (template.status === ARCHIVED_STATUS) {
          setLoadState({
            error: "",
            requestKey,
            status: "archived",
            template,
          });
          return;
        }

        setLoadState({
          error: "",
          requestKey,
          status: "loaded",
          template,
        });
      })
      .catch((error) => {
        console.error("[Question paper template] Failed to load template.", {
          error,
          templateId,
        });

        if (!isMounted) {
          return;
        }

        const isAccessError =
          error?.code === QUESTION_PAPER_TEMPLATE_ERROR_CODES.FORBIDDEN ||
          error?.code === "permission-denied";

        setLoadState({
          error: isAccessError
            ? "This template could not be found or you do not have access."
            : "Question paper template could not be loaded.",
          requestKey,
          status: isAccessError ? "access-error" : "error",
          template: null,
        });
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, requestKey, templateId, userProfile]);

  if (!isAuthLoading && !requestKey) {
    return (
      <TemplateDesignerLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Unable to open template"
      >
        <p>Your teacher account is not linked to a school.</p>
      </TemplateDesignerLoadState>
    );
  }

  if (
    isAuthLoading ||
    !requestKey ||
    loadState.requestKey !== requestKey
  ) {
    return (
      <TemplateDesignerLoadState
        indicator={<Spinner />}
        title="Loading template"
      >
        <p>Fetching the saved question paper template.</p>
      </TemplateDesignerLoadState>
    );
  }

  if (loadState.status === "not-found") {
    return (
      <TemplateDesignerLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Template not found"
      >
        <p>This template may have been deleted or belongs to another teacher.</p>
      </TemplateDesignerLoadState>
    );
  }

  if (loadState.status === "archived") {
    return (
      <TemplateDesignerLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Archived template"
      >
        <p>Archived templates cannot be edited.</p>
      </TemplateDesignerLoadState>
    );
  }

  if (loadState.status === "access-error" || loadState.status === "error") {
    return (
      <TemplateDesignerLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Unable to open template"
      >
        <p>{loadState.error}</p>
      </TemplateDesignerLoadState>
    );
  }

  return <LoadedTemplateDesignerPage template={loadState.template} />;
}

function TemplateDesignerPage() {
  const { templateId } = useParams();

  if (templateId) {
    return <EditTemplateDesignerPage templateId={templateId} />;
  }

  return <NewTemplateDesignerPage />;
}

export default TemplateDesignerPage;
