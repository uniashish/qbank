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
  topicOptions,
}) {
  return (
    <section className="question-bank-toolbar" aria-label="Question bank tools">
      <QuestionSearchInput onChange={onSearchChange} value={searchTerm} />
      <QuestionFilters
        classOptions={classOptions}
        difficultyOptions={difficultyOptions}
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={onFilterChange}
        onClear={onClearFilters}
        questionTypeOptions={questionTypeOptions}
        subjectOptions={subjectOptions}
        topicOptions={topicOptions}
      />
      <Button
        className="question-bank-toolbar__add"
        onClick={onAddQuestion}
      >
        <Icon name="plus" size={19} />
        <span>Add New Question</span>
      </Button>
    </section>
  );
}

export default QuestionBankToolbar;
