function QuestionSelectionCheckbox({
  checked = false,
  disabled = false,
  label,
  onChange,
}) {
  return (
    <label className="question-selection-checkbox">
      <input
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="sr-only">{label}</span>
    </label>
  );
}

export default QuestionSelectionCheckbox;
