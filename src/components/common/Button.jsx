import Spinner from "./Spinner.jsx";

function Button({
  children,
  className = "",
  isLoading = false,
  variant = "primary",
  type = "button",
  ...props
}) {
  const classes = ["button", `button--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...props}
      className={classes}
      disabled={isLoading || props.disabled}
      type={type}
    >
      <span className="button__content">
        {isLoading && <Spinner label="Loading" />}
        {children}
      </span>
    </button>
  );
}

export default Button;
