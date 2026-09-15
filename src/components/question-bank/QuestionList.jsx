import Spinner from "../common/Spinner.jsx";
import EmptyQuestionBankState from "./EmptyQuestionBankState.jsx";
import QuestionRow from "./QuestionRow.jsx";

function QuestionBankState({ error = "", isLoading = false }) {
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

function QuestionList({
  actionQuestionId = "",
  error = "",
  isLoading = false,
  onDelete,
  onEdit,
  onView,
  questions = [],
  totalQuestionCount = 0,
}) {
  if (isLoading || error) {
    return <QuestionBankState error={error} isLoading={isLoading} />;
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
    <div className="question-bank-list">
      <div className="question-bank-table-wrap">
        <table className="question-bank-table">
          <thead>
            <tr>
              <th scope="col">Question</th>
              <th scope="col">Type</th>
              <th scope="col">Class</th>
              <th scope="col">Subject</th>
              <th scope="col">Topic</th>
              <th scope="col">Marks</th>
              <th scope="col">Difficulty</th>
              <th scope="col">Created</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <QuestionRow
                isActionLoading={actionQuestionId === question.id}
                key={question.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onView={onView}
                question={question}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="question-bank-card-list">
        {questions.map((question) => (
          <QuestionRow
            isActionLoading={actionQuestionId === question.id}
            key={question.id}
            onDelete={onDelete}
            onEdit={onEdit}
            onView={onView}
            question={question}
            variant="card"
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionList;
