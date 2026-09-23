import { useNavigate } from "react-router-dom";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import PageContainer from "../../../components/layout/PageContainer.jsx";

function CreateQuestionPaperTemplatePlaceholderPage() {
  const navigate = useNavigate();

  return (
    <PageContainer className="question-paper-template-page" size="narrow">
      <header className="question-paper-template-header">
        <div>
          <p className="question-paper-template-header__eyebrow">
            Question Paper Templates
          </p>
          <h1>Design Template</h1>
        </div>
      </header>

      <section className="teacher-dashboard-card question-paper-template-panel question-paper-template-placeholder">
        <span className="question-paper-template-empty__icon" aria-hidden="true">
          <Icon name="fileText" size={22} />
        </span>
        <div>
          <h2>Template designer is coming in a later phase.</h2>
          <p>
            This placeholder reserves the designer route without adding designer
            logic or persistence.
          </p>
        </div>
        <Button
          className="question-paper-template-placeholder__button"
          onClick={() => navigate("/teacher/exam-papers/templates")}
          variant="secondary"
        >
          <Icon name="arrowLeft" size={18} />
          <span>Back to Templates</span>
        </Button>
      </section>
    </PageContainer>
  );
}

export default CreateQuestionPaperTemplatePlaceholderPage;
