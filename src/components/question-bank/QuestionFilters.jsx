import Button from "../common/Button.jsx";

function FilterSelect({
  disabled = false,
  id,
  label,
  onChange,
  options = [],
  placeholder,
  value,
}) {
  return (
    <label className="question-bank-filter" htmlFor={id}>
      <span>{label}</span>
      <select
        className="input question-bank-filter__select"
        disabled={disabled}
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id ?? option.value} value={option.id ?? option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function QuestionFilters({
  classOptions = [],
  difficultyOptions = [],
  filters,
  hasActiveFilters = false,
  onChange,
  onClear,
  questionTypeOptions = [],
  subjectOptions = [],
  topicOptions = [],
}) {
  return (
    <div className="question-bank-filters">
      <FilterSelect
        id="question-bank-class-filter"
        label="Class"
        onChange={(value) => onChange("classId", value)}
        options={classOptions}
        placeholder="All classes"
        value={filters.classId}
      />
      <FilterSelect
        disabled={Boolean(filters.classId) && subjectOptions.length === 0}
        id="question-bank-subject-filter"
        label="Subject"
        onChange={(value) => onChange("subjectId", value)}
        options={subjectOptions.map((subject) => ({
          id: subject.id,
          label: subject.name,
        }))}
        placeholder="All subjects"
        value={filters.subjectId}
      />
      <FilterSelect
        id="question-bank-type-filter"
        label="Type"
        onChange={(value) => onChange("questionType", value)}
        options={questionTypeOptions.map((questionType) => ({
          id: questionType.type,
          label: questionType.title,
        }))}
        placeholder="All types"
        value={filters.questionType}
      />
      <FilterSelect
        id="question-bank-difficulty-filter"
        label="Difficulty"
        onChange={(value) => onChange("difficulty", value)}
        options={difficultyOptions.map((difficulty) => ({
          id: difficulty.value,
          label: difficulty.label,
        }))}
        placeholder="All difficulties"
        value={filters.difficulty}
      />
      <FilterSelect
        id="question-bank-topic-filter"
        label="Topic"
        onChange={(value) => onChange("topicName", value)}
        options={topicOptions}
        placeholder="All topics"
        value={filters.topicName}
      />
      <Button
        className="question-bank-filters__clear"
        disabled={!hasActiveFilters}
        onClick={onClear}
        variant="secondary"
      >
        Clear Filters
      </Button>
    </div>
  );
}

export default QuestionFilters;
