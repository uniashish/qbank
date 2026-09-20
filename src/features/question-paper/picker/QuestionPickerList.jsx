import Spinner from "../../../components/common/Spinner.jsx";
import DifficultyBadge from "../../../components/question-bank/DifficultyBadge.jsx";
import EmptyQuestionBankState from "../../../components/question-bank/EmptyQuestionBankState.jsx";
import QuestionSelectionCheckbox from "../../question-sharing/QuestionSelectionCheckbox.jsx";
import QuestionTypeBadge from "../../../components/question-bank/QuestionTypeBadge.jsx";
import QuestionPickerRow, { QuestionPickerPrompt } from "./QuestionPickerRow.jsx";

function QuestionPickerState({ error = "", isLoading = false }) {
  if (isLoading) {
    return (
      <div className="question-bank-state" role="status">
        <Spinner label="Loading questions" />
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="question-bank-state question-bank-state--error" role="alert">
        <p>{error}</p>
      </div>
    );
  }

  return null;
}

function QuestionPickerCard({
  alreadyAdded,
  isSelected,
  onSelectionChange,
  question,
}) {
  return (
    <article
      className={[
        "question-bank-card question-picker-card",
        alreadyAdded ? "question-picker-card--disabled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <header className="question-picker-card__header">
        <QuestionSelectionCheckbox
          checked={isSelected}
          disabled={alreadyAdded}
          label={`Select question: ${question.prompt}`}
          onChange={(isChecked) => onSelectionChange(question, isChecked)}
        />
        <QuestionPickerPrompt question={question} />
        <QuestionTypeBadge label={question.questionTypeLabel} />
      </header>
      <dl className="question-bank-card__meta">
        <div>
          <dt>Class</dt>
          <dd>{question.className}</dd>
        </div>
        <div>
          <dt>Subject</dt>
          <dd>{question.subjectName}</dd>
        </div>
        <div>
          <dt>Topic</dt>
          <dd>{question.topicName || "Not set"}</dd>
        </div>
        <div>
          <dt>Marks</dt>
          <dd>{question.marks}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>
            <DifficultyBadge
              difficulty={question.difficulty}
              label={question.difficultyLabel}
            />
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            {alreadyAdded ? (
              <span className="question-picker-status">Already in paper</span>
            ) : (
              <span className="question-picker-status question-picker-status--available">
                Available
              </span>
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function QuestionPickerList({
  alreadyAddedQuestionIdSet,
  error,
  isLoading,
  onSelectionChange,
  questions,
  selectedQuestionIds,
  totalQuestionCount,
}) {
  const selectedQuestionIdSet = new Set(selectedQuestionIds);

  if (isLoading || error) {
    return <QuestionPickerState error={error} isLoading={isLoading} />;
  }

  if (questions.length === 0) {
    return totalQuestionCount > 0 ? (
      <EmptyQuestionBankState
        description="Adjust search or filters to find a saved question."
        title="No matching questions"
      />
    ) : (
      <EmptyQuestionBankState />
    );
  }

  return (
    <div className="question-picker-results">
      <div className="question-bank-table-wrap question-picker-table-wrap">
        <table className="question-bank-table question-picker-table">
          <thead>
            <tr>
              <th className="question-bank-selection-column" scope="col">
                Select
              </th>
              <th scope="col">Question</th>
              <th scope="col">Type</th>
              <th scope="col">Class</th>
              <th scope="col">Subject</th>
              <th scope="col">Topic</th>
              <th scope="col">Marks</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <QuestionPickerRow
                alreadyAdded={alreadyAddedQuestionIdSet.has(question.id)}
                isSelected={selectedQuestionIdSet.has(question.id)}
                key={question.id}
                onSelectionChange={onSelectionChange}
                question={question}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="question-picker-card-list">
        {questions.map((question) => (
          <QuestionPickerCard
            alreadyAdded={alreadyAddedQuestionIdSet.has(question.id)}
            isSelected={selectedQuestionIdSet.has(question.id)}
            key={question.id}
            onSelectionChange={onSelectionChange}
            question={question}
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionPickerList;
