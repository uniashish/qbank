import Icon from "../../../components/common/Icon.jsx";

function QuestionPaperSearch({ onChange, value }) {
  return (
    <div className="question-paper-search">
      <label className="sr-only" htmlFor="question-paper-search">
        Search papers
      </label>
      <Icon className="question-paper-search__icon" name="search" size={18} />
      <input
        className="input question-paper-search__input"
        id="question-paper-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search papers..."
        type="search"
        value={value}
      />
    </div>
  );
}

export default QuestionPaperSearch;
