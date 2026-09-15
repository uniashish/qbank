import {
  MAX_MULTIPLE_CHOICE_OPTIONS,
  MIN_MULTIPLE_CHOICE_OPTIONS,
} from "./multipleChoiceValidation.js";
import { getOptionLabel } from "../../constants/optionLabels.js";
import AddOptionButton from "./AddOptionButton.jsx";
import MultipleChoiceOptionRow from "./MultipleChoiceOptionRow.jsx";

function MultipleChoiceOptionsList({
  multipleChoice,
  onAddOption,
  onCorrectChange,
  onRemoveOption,
  onTextChange,
  validationErrors = {},
}) {
  const options = multipleChoice.options;
  const canAddOption = options.length < MAX_MULTIPLE_CHOICE_OPTIONS;
  const canRemoveOption = options.length > MIN_MULTIPLE_CHOICE_OPTIONS;

  return (
    <section
      className="multiple-choice-options"
      aria-labelledby="multiple-choice-options-title"
    >
      <div className="multiple-choice-options__header">
        <h4 id="multiple-choice-options-title">Answer Options</h4>
        <span>{options.length}/{MAX_MULTIPLE_CHOICE_OPTIONS}</span>
      </div>

      {validationErrors.options && (
        <p className="form-field__error" role="alert">
          {validationErrors.options}
        </p>
      )}

      <fieldset className="multiple-choice-options__fieldset">
        <legend className="sr-only">Multiple choice answer options</legend>
        {options.map((option, index) => (
          <MultipleChoiceOptionRow
            canRemove={canRemoveOption}
            error={validationErrors.optionTexts?.[option.id]}
            isCorrect={multipleChoice.correctOptionId === option.id}
            key={option.id}
            label={getOptionLabel(index)}
            onCorrectChange={onCorrectChange}
            onRemove={onRemoveOption}
            onTextChange={onTextChange}
            option={option}
          />
        ))}
      </fieldset>

      {validationErrors.correctOptionId && (
        <p className="form-field__error" role="alert">
          {validationErrors.correctOptionId}
        </p>
      )}

      <AddOptionButton disabled={!canAddOption} onClick={onAddOption} />
    </section>
  );
}

export default MultipleChoiceOptionsList;
