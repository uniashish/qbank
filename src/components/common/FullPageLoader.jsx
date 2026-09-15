import Spinner from "./Spinner.jsx";

function FullPageLoader({ label = "Loading QBank" }) {
  return (
    <main className="full-page-loader" aria-busy="true">
      <section className="full-page-loader__panel" aria-live="polite">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <Spinner label={label} />
        <p>{label}</p>
      </section>
    </main>
  );
}

export default FullPageLoader;
