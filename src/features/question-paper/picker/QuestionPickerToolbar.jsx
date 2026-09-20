import QuestionFilters from "../../../components/question-bank/QuestionFilters.jsx";
import QuestionSearchInput from "../../../components/question-bank/QuestionSearchInput.jsx";

function QuestionPickerToolbar({
  classOptions,
  difficultyOptions,
  filters,
  hasActiveFilters,
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
    <section className="question-picker-toolbar" aria-label="Question filters">
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
        tagOptions={tagOptions}
        topicOptions={topicOptions}
      />
    </section>
  );
}

export default QuestionPickerToolbar;
