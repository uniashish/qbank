import Icon from "../common/Icon.jsx";
import Button from "../common/Button.jsx";
import QuestionFilters from "./QuestionFilters.jsx";
import QuestionSearchInput from "./QuestionSearchInput.jsx";

function QuestionBankToolbar({
  classOptions,
  difficultyOptions,
  filters,
  hasActiveFilters,
  onAddQuestion,
  onClearFilters,
  onFilterChange,
  onSearchChange,
  questionTypeOptions,
  searchTerm,
  subjectOptions,
  tagOptions,
  topicOptions,
}) {
  return (
    <section className="question-bank-toolbar" aria-label="Question bank tools">
      <div className="question-bank-toolbar__primary">
        <QuestionSearchInput onChange={onSearchChange} value={searchTerm} />
        {onAddQuestion && (
          <Button
            className="question-bank-toolbar__add"
            onClick={onAddQuestion}
          >
            <Icon name="plus" size={18} />
            <span>Add Question</span>
          </Button>
        )}
      </div>
      <QuestionFilters
        classOptions={classOptions}
        difficultyOptions={difficultyOptions}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={onFilterChange}
        onClear={onClearFilters}
        questionTypeOptions={questionTypeOptions}
        subjectOptions={subjectOptions}
        tagOptions={tagOptions}
        topicOptions={topicOptions}
      />
    </section>
  );
}

export default QuestionBankToolbar;
