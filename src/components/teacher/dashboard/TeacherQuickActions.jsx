import { Link } from "react-router-dom";

import Icon from "../../common/Icon.jsx";

const teacherActions = [
  {
    description: "Open your assigned subject question tools when available.",
    icon: "book",
    label: "Question Bank",
    path: "/teacher/question-bank",
  },
  {
    description: "Prepare and review exam papers when available.",
    icon: "fileText",
    label: "Exam Papers",
    path: "/teacher/exam-papers",
  },
];

function TeacherQuickActions() {
  return (
    <section className="teacher-dashboard-card">
      <div className="teacher-dashboard-card__header">
        <div>
          <h2>Quick Access</h2>
          <p>These tools will use your assigned classes and subjects.</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {teacherActions.map((action) => (
          <Link className="quick-action-card" key={action.path} to={action.path}>
            <span className="quick-action-card__icon" aria-hidden="true">
              <Icon name={action.icon} size={20} />
            </span>
            <span>
              <span className="quick-action-card__label">{action.label}</span>
              <span className="quick-action-card__description">
                {action.description}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default TeacherQuickActions;
