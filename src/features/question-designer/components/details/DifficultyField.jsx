import FormField from "../../../../components/common/FormField.jsx";
import { DIFFICULTY_LEVEL_OPTIONS } from "../../constants/difficultyLevels.js";

function DifficultyField({ error, onChange, value }) {
  const fieldId = "question-difficulty";
  const describedBy = error ? `${fieldId}-error` : undefined;

  return (
    <FormField error={error} htmlFor={fieldId} label="Difficulty Level" required>
      <select
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className="input question-details-select"
        id={fieldId}
        onChange={(event) => onChange(event.target.value || null)}
        value={value ?? ""}
      >
        <option value="">Select difficulty</option>
        {DIFFICULTY_LEVEL_OPTIONS.map((difficultyOption) => (
          <option key={difficultyOption.value} value={difficultyOption.value}>
            {difficultyOption.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

export default DifficultyField;
