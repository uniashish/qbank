function SuggestedWordCountField({ error, onChange, value }) {
  const fieldId = "long-answer-suggested-word-count";
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className="rich-answer-editor__word-count">
      <label className="rich-answer-editor__word-count-label" htmlFor={fieldId}>
        Suggested Word Count
      </label>
      <input
        aria-describedby={errorId}
        aria-invalid={Boolean(error)}
        className="input rich-answer-editor__word-count-input"
        id={fieldId}
        min="1"
        onChange={(event) => onChange(event.target.value)}
        placeholder="300"
        type="number"
        value={value ?? ""}
      />
      {error && (
        <p className="rich-answer-editor__error" id={errorId} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default SuggestedWordCountField;
