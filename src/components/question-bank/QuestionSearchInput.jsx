import Icon from "../common/Icon.jsx";

function QuestionSearchInput({ onChange, value }) {
  return (
    <div className="question-bank-search">
      <label className="sr-only" htmlFor="question-bank-search">
        Search questions
      </label>
      <Icon className="question-bank-search__icon" name="search" size={18} />
      <input
        className="input question-bank-search__input"
        id="question-bank-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search questions..."
        type="search"
        value={value}
      />
    </div>
  );
}

export default QuestionSearchInput;
