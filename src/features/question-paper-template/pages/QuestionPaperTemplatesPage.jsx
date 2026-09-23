import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import TemplateList from "../components/TemplateList.jsx";
import TemplateSearch from "../components/TemplateSearch.jsx";
import { useQuestionPaperTemplates } from "../hooks/useQuestionPaperTemplates.js";
import { archiveQuestionPaperTemplate } from "../services/questionPaperTemplateService.js";

function matchesSearchTerm(template, searchTerm) {
  if (!searchTerm) {
    return true;
  }

  const haystack = [template.name, template.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchTerm);
}

function QuestionPaperTemplatesPage() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { error, loading, refresh, templates } = useQuestionPaperTemplates();
  const [archiveState, setArchiveState] = useState({
    error: "",
    templateId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredTemplates = useMemo(
    () =>
      templates.filter((template) =>
        matchesSearchTerm(template, normalizedSearchTerm),
      ),
    [normalizedSearchTerm, templates],
  );

  const handleCreateTemplate = () => {
    navigate("/teacher/exam-papers/templates/new");
  };

  const handleEditTemplate = useCallback(
    (template) => {
      navigate(`/teacher/exam-papers/templates/${template.id}/edit`);
    },
    [navigate],
  );

  const handleArchiveTemplate = useCallback(
    async (template) => {
      const templateName = template.name || "Untitled template";
      const confirmed = window.confirm(
        `Archive "${templateName}"? It will be hidden from your active templates.`,
      );

      if (!confirmed) {
        return;
      }

      setArchiveState({
        error: "",
        templateId: template.id,
      });

      try {
        await archiveQuestionPaperTemplate({
          templateId: template.id,
          userProfile,
        });
        await refresh();
        setArchiveState({
          error: "",
          templateId: "",
        });
      } catch (archiveError) {
        console.error("[Question paper template] Failed to archive template.", {
          error: archiveError,
          templateId: template.id,
        });

        setArchiveState({
          error:
            archiveError?.message ||
            "Question paper template could not be archived.",
          templateId: "",
        });
      }
    },
    [refresh, userProfile],
  );

  return (
    <PageContainer className="question-paper-template-page">
      <header className="question-paper-template-header">
        <div>
          <p className="question-paper-template-header__eyebrow">Exam Papers</p>
          <h1>Question Paper Templates</h1>
        </div>
        <Button
          className="question-paper-template-header__button"
          onClick={handleCreateTemplate}
        >
          <Icon name="plus" size={18} />
          <span>Create Template</span>
        </Button>
      </header>

      <section className="teacher-dashboard-card question-paper-template-panel">
        <div className="teacher-dashboard-card__header">
          <div>
            <h2>My Templates</h2>
            <p>Reusable question paper templates will appear here.</p>
          </div>
        </div>

        <TemplateSearch onChange={setSearchTerm} value={searchTerm} />

        {archiveState.error && (
          <div
            className="question-paper-template-feedback question-paper-template-feedback--error"
            role="alert"
          >
            {archiveState.error}
          </div>
        )}

        {loading ? (
          <div className="question-paper-template-inline-state">
            <Spinner />
            <p>Loading question paper templates.</p>
          </div>
        ) : error ? (
          <div className="question-paper-template-inline-state question-paper-template-inline-state--error">
            <Icon name="alert" size={20} />
            <p>{error}</p>
          </div>
        ) : (
          <TemplateList
            archivingTemplateId={archiveState.templateId}
            hasTemplates={templates.length > 0}
            isSearching={Boolean(normalizedSearchTerm)}
            onArchiveTemplate={handleArchiveTemplate}
            onCreateTemplate={handleCreateTemplate}
            onEditTemplate={handleEditTemplate}
            templates={filteredTemplates}
          />
        )}
      </section>
    </PageContainer>
  );
}

export default QuestionPaperTemplatesPage;
