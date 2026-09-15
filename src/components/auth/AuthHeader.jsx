function AuthHeader() {
  return (
    <header className="auth-header">
      <div className="auth-header__brand">
        <span className="brand-mark" aria-hidden="true">
          QB
        </span>
        <div>
          <p className="auth-header__product">QBank</p>
          <p className="auth-header__tagline">
            Question Bank &amp; Exam Paper Generator
          </p>
        </div>
      </div>

      <div className="auth-header__intro">
        <h1 id="auth-title">Welcome back</h1>
        <p>Sign in to continue to your workspace.</p>
      </div>
    </header>
  );
}

export default AuthHeader;
