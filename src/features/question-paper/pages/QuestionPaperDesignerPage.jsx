import { useEffect, useMemo, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";

import Icon from "../../../components/common/Icon.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { useTeacherQuestionAssignments } from "../../question-designer/hooks/useTeacherQuestionAssignments.js";
import QuestionPaperDesigner from "../designer/QuestionPaperDesigner.jsx";
import {
  QUESTION_PAPER_ERROR_CODES,
  getQuestionPaper,
} from "../services/questionPaperService.js";

function QuestionPaperLoadState({
  children,
  indicator,
  isError = false,
  title,
}) {
  return (
    <PageContainer className="question-papers-page question-paper-setup-page">
      <section
        className={[
          "teacher-dashboard-card",
          "question-papers-panel",
          "question-paper-setup-state",
          isError ? "question-paper-setup-state--error" : "",
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

function NewQuestionPaperDesignerPage() {
  const location = useLocation();
  const paperSetup = location.state?.paperSetup;
  const initialDraft = useMemo(() => ({ setup: paperSetup }), [paperSetup]);

  if (!paperSetup) {
    return <Navigate replace to="/teacher/exam-papers/new" />;
  }

  return <QuestionPaperDesigner initialDraft={initialDraft} />;
}

function LoadedQuestionPaperDesigner({ assignmentState, paper }) {
  const initialDraft = useMemo(
    () => ({
      assignmentState,
      paper,
      paperId: paper.id,
      updatedAt: paper.updatedAt,
    }),
    [assignmentState, paper],
  );

  return <QuestionPaperDesigner initialDraft={initialDraft} />;
}

function EditQuestionPaperDesignerPage({ paperId }) {
  const { loading: isAuthLoading, userProfile } = useAuth();
  const assignmentState = useTeacherQuestionAssignments({ enabled: true });
  const requestKey =
    !isAuthLoading && userProfile?.schoolId && userProfile?.uid
      ? `${userProfile.schoolId}:${userProfile.uid}:${paperId}`
      : "";
  const [loadState, setLoadState] = useState({
    error: "",
    paper: null,
    requestKey: "",
    status: "loading",
  });

  useEffect(() => {
    let isMounted = true;

    if (isAuthLoading) {
      return undefined;
    }

    if (!requestKey) {
      return undefined;
    }

    getQuestionPaper({ paperId, userProfile })
      .then((paper) => {
        if (!isMounted) {
          return;
        }

        if (!paper) {
          setLoadState({
            error: "",
            paper: null,
            requestKey,
            status: "not-found",
          });
          return;
        }

        setLoadState({
          error: "",
          paper,
          requestKey,
          status: "loaded",
        });
      })
      .catch((error) => {
        console.error("[Question paper] Failed to load paper.", {
          error,
          paperId,
        });

        if (!isMounted) {
          return;
        }

        const isAccessError =
          error?.code === QUESTION_PAPER_ERROR_CODES.FORBIDDEN ||
          error?.code === "permission-denied";

        setLoadState({
          error: isAccessError
            ? "This paper could not be found or you do not have access."
            : "Question paper could not be loaded.",
          paper: null,
          requestKey,
          status: "error",
        });
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, paperId, requestKey, userProfile]);

  if (!isAuthLoading && !requestKey) {
    return (
      <QuestionPaperLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Unable to open paper"
      >
        <p>Your teacher account is not linked to a school.</p>
      </QuestionPaperLoadState>
    );
  }

  if (
    isAuthLoading ||
    !requestKey ||
    loadState.requestKey !== requestKey ||
    assignmentState.isLoading
  ) {
    return (
      <QuestionPaperLoadState
        indicator={<Spinner />}
        title="Loading question paper"
      >
        <p>Fetching the saved paper.</p>
      </QuestionPaperLoadState>
    );
  }

  if (loadState.status === "not-found") {
    return (
      <QuestionPaperLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Paper not found"
      >
        <p>This paper may have been deleted or belongs to another teacher.</p>
      </QuestionPaperLoadState>
    );
  }

  if (loadState.status === "error") {
    return (
      <QuestionPaperLoadState
        indicator={<Icon name="alert" size={28} />}
        isError
        title="Unable to open paper"
      >
        <p>{loadState.error}</p>
      </QuestionPaperLoadState>
    );
  }

  return (
    <LoadedQuestionPaperDesigner
      assignmentState={assignmentState}
      paper={loadState.paper}
    />
  );
}

function QuestionPaperDesignerPage() {
  const { paperId } = useParams();

  if (paperId) {
    return <EditQuestionPaperDesignerPage paperId={paperId} />;
  }

  return <NewQuestionPaperDesignerPage />;
}

export default QuestionPaperDesignerPage;
