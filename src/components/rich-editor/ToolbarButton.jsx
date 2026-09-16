function ToolbarButton({
  active = false,
  disabled = false,
  icon,
  label,
  onClick,
}) {
  const className = [
    "rich-text-editor-toolbar__button",
    active ? "rich-text-editor-toolbar__button--active" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={className}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={(event) => event.preventDefault()}
      title={label}
      type="button"
    >
      <span aria-hidden="true" className="rich-text-editor-toolbar__icon">
        {icon}
      </span>
    </button>
  );
}

export default ToolbarButton;
