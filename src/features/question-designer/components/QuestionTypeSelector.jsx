import { QUESTION_TYPE_OPTIONS } from "../constants/questionTypes.js";
import QuestionTypeCard from "./QuestionTypeCard.jsx";

function QuestionTypeSelector({ onSelectType, selectedType }) {
  return (
    <section
      className="question-type-selector"
      aria-labelledby="question-type-selector-title"
    >
      <div className="question-designer-section-header">
        <h3 id="question-type-selector-title">Select Question Type</h3>
        <p>Choose how learners will respond to this question.</p>
      </div>

      <div className="question-type-grid" role="list">
        {QUESTION_TYPE_OPTIONS.map((questionType) => (
          <div key={questionType.type} role="listitem">
            <QuestionTypeCard
              description={questionType.description}
              icon={questionType.icon}
              onSelect={onSelectType}
              selected={selectedType === questionType.type}
              title={questionType.title}
              type={questionType.type}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default QuestionTypeSelector;
