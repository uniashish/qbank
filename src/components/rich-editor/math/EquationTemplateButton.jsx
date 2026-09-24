function EquationTemplateButton({ item, onInsert }) {
  const buttonLabel = item.shortLabel || item.label;

  return (
    <button
      aria-label={item.ariaLabel}
      className="rich-text-editor-equation-palette__button"
      onClick={() => onInsert(item)}
      onMouseDown={(event) => event.preventDefault()}
      title={item.ariaLabel}
      type="button"
    >
      {buttonLabel}
    </button>
  );
}

export default EquationTemplateButton;
