import Icon from "../../../components/common/Icon.jsx";

function TemplateSearch({ onChange, value }) {
  return (
    <div className="question-paper-template-search">
      <label className="sr-only" htmlFor="question-paper-template-search">
        Search templates
      </label>
      <Icon
        className="question-paper-template-search__icon"
        name="search"
        size={18}
      />
      <input
        className="input question-paper-template-search__input"
        id="question-paper-template-search"
        onChange={(event) => onChange(event.target.value)}
        placeholder="Search templates..."
        type="search"
        value={value}
      />
    </div>
  );
}

export default TemplateSearch;
