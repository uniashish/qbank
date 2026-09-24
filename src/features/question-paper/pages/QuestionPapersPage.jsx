import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../../../components/common/Icon.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { getClassesForSchool } from "../../../services/classService.js";
import { getSubjectsForSchool } from "../../../services/subjectService.js";
import AnswerKeyPreview from "../answer-key/AnswerKeyPreview.jsx";
import {
  DEFAULT_ANSWER_KEY_OPTIONS,
  generateAnswerKeyModel,
} from "../answer-key/answerKeyGenerator.js";
import QuestionPaperActions from "../components/QuestionPaperActions.jsx";
import QuestionPaperList from "../components/QuestionPaperList.jsx";
import QuestionPaperSearch from "../components/QuestionPaperSearch.jsx";
import DeleteQuestionPaperDialog from "../delete/DeleteQuestionPaperDialog.jsx";
import ExportPaperDialog from "../export/ExportPaperDialog.jsx";
import GoogleDocsExportDialog from "../export/google-docs/GoogleDocsExportDialog.jsx";
import { exportQuestionPaperGoogleDocs } from "../export/google-docs/googleDocsExportService.js";
import {
  deleteQuestionPaper,
  getCurrentTeacherQuestionPapers,
} from "../services/questionPaperService.js";

function matchesSearchTerm(paper, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const haystack = [
    paper.title,
    paper.className,
    paper.class,
    paper.subject,
    paper.difficulty,
    paper.status,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function createLookup(items = []) {
  return new Map(items.map((item) => [item.id, item]));
}

function enrichPaper(paper, { classById, subjectById }) {
  return {
    ...paper,
    className: classById.get(paper.classId)?.name ?? paper.classId,
    difficulty: paper.difficultySummary?.overallDifficulty ?? "Not set",
    subject: subjectById.get(paper.subjectId)?.name ?? paper.subjectId,
  };
}

function QuestionPapersPage() {
  const navigate = useNavigate();
  const { firebaseUser, loading: isAuthLoading, userProfile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [answerKeyOptions, setAnswerKeyOptions] = useState(
    DEFAULT_ANSWER_KEY_OPTIONS,
  );
  const [answerKeyPaper, setAnswerKeyPaper] = useState(null);
  const [deleteState, setDeleteState] = useState({
    error: "",
    isDeleting: false,
    paper: null,
  });
  const [exportPaper, setExportPaper] = useState(null);
  const [exportState, setExportState] = useState({
    error: "",
    isExporting: false,
    successMessage: "",
  });
  const [googleDocsPaper, setGoogleDocsPaper] = useState(null);
  const [googleDocsExportState, setGoogleDocsExportState] = useState({
    createdDocs: [],
    error: "",
    isExporting: false,
  });
  const [paperState, setPaperState] = useState({
    error: "",
    papers: [],
    requestKey: "",
  });
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const requestKey =
    !isAuthLoading && userProfile?.schoolId && userProfile?.uid
      ? `${userProfile.schoolId}:${userProfile.uid}`
      : "";

  useEffect(() => {
    let isMounted = true;

    if (!requestKey) {
      return undefined;
    }

    Promise.all([
      getCurrentTeacherQuestionPapers(userProfile),
      getClassesForSchool(userProfile.schoolId),
      getSubjectsForSchool(userProfile.schoolId),
    ])
      .then(([papers, classes, subjects]) => {
        if (!isMounted) {
          return;
        }

        const academicLookups = {
          classById: createLookup(classes),
          subjectById: createLookup(subjects),
        };

        setPaperState({
          error: "",
          papers: papers.map((paper) => enrichPaper(paper, academicLookups)),
          requestKey,
        });
      })
      .catch((error) => {
        console.error("[Question paper] Failed to load papers.", {
          error,
        });

        if (isMounted) {
          setPaperState({
            error: "Question papers could not be loaded.",
            papers: [],
            requestKey,
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [requestKey, userProfile]);

  const handleOpenPaper = useCallback(
    (paper) => {
      navigate(`/teacher/exam-papers/${paper.id}/edit`);
    },
    [navigate],
  );
  const handleOpenAnswerKey = useCallback((paper) => {
    setAnswerKeyPaper(paper);
  }, []);
  const handleCloseAnswerKey = useCallback(() => {
    setAnswerKeyPaper(null);
  }, []);
  const handleOpenDeletePaper = useCallback((paper) => {
    setDeleteState({
      error: "",
      isDeleting: false,
      paper,
    });
  }, []);
  const handleCloseDeleteDialog = useCallback(() => {
    setDeleteState((currentState) => {
      if (currentState.isDeleting) {
        return currentState;
      }

      return {
        error: "",
        isDeleting: false,
        paper: null,
      };
    });
  }, []);
  const handleDeletePaper = useCallback(async () => {
    const paper = deleteState.paper;

    if (!paper) {
      return;
    }

    setDeleteState((currentState) => ({
      ...currentState,
      error: "",
      isDeleting: true,
    }));

    try {
      await deleteQuestionPaper({
        paperId: paper.id,
        userProfile,
      });

      setPaperState((currentState) => ({
        ...currentState,
        papers: currentState.papers.filter(
          (currentPaper) => currentPaper.id !== paper.id,
        ),
      }));
      setDeleteState({
        error: "",
        isDeleting: false,
        paper: null,
      });
    } catch (error) {
      console.error("[Question paper] Failed to delete paper.", {
        error,
        paperId: paper.id,
      });
      setDeleteState((currentState) => ({
        ...currentState,
        error: error?.message || "Question paper could not be deleted.",
        isDeleting: false,
      }));
    }
  }, [deleteState.paper, userProfile]);
  const handleOpenExportPaper = useCallback((paper) => {
    setExportPaper(paper);
    setExportState({
      error: "",
      isExporting: false,
      successMessage: "",
    });
  }, []);
  const handleCloseExportDialog = useCallback(() => {
    setExportPaper(null);
    setExportState({
      error: "",
      isExporting: false,
      successMessage: "",
    });
  }, []);
  const handleOpenGoogleDocsExport = useCallback((paper) => {
    setGoogleDocsPaper(paper);
    setGoogleDocsExportState({
      createdDocs: [],
      error: "",
      isExporting: false,
    });
  }, []);
  const handleCloseGoogleDocsExport = useCallback(() => {
    setGoogleDocsPaper(null);
    setGoogleDocsExportState({
      createdDocs: [],
      error: "",
      isExporting: false,
    });
  }, []);
  const handleExportPaper = useCallback(
    async ({ answerKeyOptions: exportAnswerKeyOptions, pageSize }) => {
      if (!exportPaper) {
        return;
      }

      setExportState({
        error: "",
        isExporting: true,
        successMessage: "",
      });

      try {
        const { exportQuestionPaperPdf } = await import(
          "../export/pdf/exportQuestionPaperPdf.js"
        );

        await exportQuestionPaperPdf({
          answerKeyOptions: exportAnswerKeyOptions,
          pageSize,
          paper: exportPaper,
        });
        setExportState({
          error: "",
          isExporting: false,
          successMessage: "PDF downloaded",
        });
      } catch (error) {
        console.error("[Question paper] PDF export failed.", { error });
        setExportState({
          error: error?.message || "Question paper could not be exported.",
          isExporting: false,
          successMessage: "",
        });
      }
    },
    [exportPaper],
  );
  const handleExportGoogleDocs = useCallback(
    async ({ answerKeyOptions: exportAnswerKeyOptions }) => {
      if (!googleDocsPaper) {
        return;
      }

      setGoogleDocsExportState({
        createdDocs: [],
        error: "",
        isExporting: true,
      });

      try {
        const createdDocs = await exportQuestionPaperGoogleDocs({
          answerKeyOptions: exportAnswerKeyOptions,
          firebaseUser,
          paperId: googleDocsPaper.id,
        });

        setGoogleDocsExportState({
          createdDocs,
          error: "",
          isExporting: false,
        });
      } catch (error) {
        console.error("[Question paper] Google Docs export failed.", { error });
        setGoogleDocsExportState({
          createdDocs: error.docs ?? [],
          error: error?.message || "Question paper could not be exported.",
          isExporting: false,
        });
      }
    },
    [firebaseUser, googleDocsPaper],
  );

  const filteredPapers = useMemo(
    () =>
      paperState.papers.filter((paper) =>
        matchesSearchTerm(paper, normalizedSearchTerm),
      ),
    [normalizedSearchTerm, paperState.papers],
  );

  const draftPapers = useMemo(
    () => filteredPapers.filter((paper) => paper.status !== "final"),
    [filteredPapers],
  );
  const finalizedPapers = useMemo(
    () => filteredPapers.filter((paper) => paper.status === "final"),
    [filteredPapers],
  );
  const selectedAnswerKey = useMemo(
    () =>
      generateAnswerKeyModel({
        documentContent: answerKeyPaper?.documentContent,
        questionBlocks: answerKeyPaper?.questions,
      }),
    [answerKeyPaper],
  );
  const isLoading =
    isAuthLoading || (Boolean(requestKey) && paperState.requestKey !== requestKey);
  const error =
    !isAuthLoading && !requestKey
      ? "Your teacher account is not linked to a school."
      : paperState.error;

  return (
    <PageContainer className="question-papers-page">
      <header className="question-papers-header">
        <div>
          <p className="question-papers-header__eyebrow">Teacher Tools</p>
          <h1>Exam Papers</h1>
        </div>
        <QuestionPaperActions
          onCreatePaper={() => navigate("/teacher/exam-papers/new")}
        />
      </header>

      <section className="teacher-dashboard-card question-papers-panel">
        <div className="teacher-dashboard-card__header">
          <div>
            <h2>My Papers</h2>
            <p>Draft and finalized question papers will appear here.</p>
          </div>
        </div>

        <QuestionPaperSearch onChange={setSearchTerm} value={searchTerm} />

        {isLoading ? (
          <div className="question-paper-inline-state">
            <Spinner />
            <p>Loading question papers.</p>
          </div>
        ) : error ? (
          <div className="question-paper-inline-state question-paper-inline-state--error">
            <Icon name="alert" size={20} />
            <p>{error}</p>
          </div>
        ) : (
          <QuestionPaperList
            draftPapers={draftPapers}
            finalizedPapers={finalizedPapers}
            onDeletePaper={handleOpenDeletePaper}
            onExportGoogleDocs={handleOpenGoogleDocsExport}
            onExportPaper={handleOpenExportPaper}
            onOpenAnswerKey={handleOpenAnswerKey}
            onOpenPaper={handleOpenPaper}
          />
        )}
      </section>

      <AnswerKeyPreview
        answerKey={selectedAnswerKey}
        isOpen={Boolean(answerKeyPaper)}
        onClose={handleCloseAnswerKey}
        onOptionsChange={setAnswerKeyOptions}
        options={answerKeyOptions}
      />
      <DeleteQuestionPaperDialog
        error={deleteState.error}
        isDeleting={deleteState.isDeleting}
        isOpen={Boolean(deleteState.paper)}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeletePaper}
        paper={deleteState.paper}
      />
      {exportPaper && (
        <ExportPaperDialog
          error={exportState.error}
          isExporting={exportState.isExporting}
          isOpen
          onClose={handleCloseExportDialog}
          onExport={handleExportPaper}
          paper={exportPaper}
          successMessage={exportState.successMessage}
        />
      )}
      {googleDocsPaper && (
        <GoogleDocsExportDialog
          createdDocs={googleDocsExportState.createdDocs}
          error={googleDocsExportState.error}
          isExporting={googleDocsExportState.isExporting}
          isOpen
          onClose={handleCloseGoogleDocsExport}
          onExport={handleExportGoogleDocs}
          paper={googleDocsPaper}
        />
      )}
    </PageContainer>
  );
}

export default QuestionPapersPage;
