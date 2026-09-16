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
  onRemove,
  onSelectionChange,
  onView,
  questions = [],
  selectedIds = [],
  selectionMode = false,
  totalQuestionCount = 0,
}) {
  const selectedIdSet = new Set(selectedIds);

  function handleSelectionChange(questionId, isSelected) {
    const nextSelectedIds = new Set(selectedIds);

    if (isSelected) {
      nextSelectedIds.add(questionId);
    } else {
      nextSelectedIds.delete(questionId);
    }

    onSelectionChange?.([...nextSelectedIds]);
  }

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
              {selectionMode && (
                <th className="question-bank-selection-column" scope="col">
                  Select
                </th>
              )}
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
                isSelected={selectedIdSet.has(question.id)}
                key={question.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onRemove={onRemove}
                onSelectionChange={handleSelectionChange}
                onView={onView}
                question={question}
                selectionMode={selectionMode}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="question-bank-card-list">
        {questions.map((question) => (
          <QuestionRow
            isActionLoading={actionQuestionId === question.id}
            isSelected={selectedIdSet.has(question.id)}
            key={question.id}
            onDelete={onDelete}
            onEdit={onEdit}
            onRemove={onRemove}
            onSelectionChange={handleSelectionChange}
            onView={onView}
            question={question}
            selectionMode={selectionMode}
            variant="card"
          />
        ))}
      </div>
    </div>
  );
}

export default QuestionList;
