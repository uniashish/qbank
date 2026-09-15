function Spinner({ size = "sm", label = "Loading" }) {
  return (
    <span className={`spinner spinner--${size}`} role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export default Spinner;
