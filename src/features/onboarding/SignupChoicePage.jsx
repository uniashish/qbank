import { Navigate } from "react-router-dom";

import FullPageLoader from "../../components/common/FullPageLoader.jsx";
import { useAuth } from "../../hooks/useAuth.js";
import { getRouteForUserProfile } from "../../utils/getRouteForUserProfile.js";
import SignupChoiceCard from "./SignupChoiceCard.jsx";

function SignupChoicePage() {
  const { loading, userProfile } = useAuth();

  if (loading) {
    return <FullPageLoader label="Loading signup" />;
  }

  if (userProfile) {
    return <Navigate replace to={getRouteForUserProfile(userProfile)} />;
  }

  return (
    <main className="onboarding-page">
      <section className="onboarding-card" aria-labelledby="signup-title">
        <div className="onboarding-card__brand">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <div>
            <p>QBank</p>
            <span>Sign Up</span>
          </div>
        </div>

        <div className="onboarding-card__intro">
          <h1 id="signup-title">Create your account</h1>
          <p>Choose how your school should start using QBank.</p>
        </div>

        <div className="signup-choice-grid">
          <SignupChoiceCard
            description="Register your school and become the School Admin."
            title="Create a New School"
            to="/signup/create-school"
          />
          <SignupChoiceCard
            description="Request access to a school that already uses QBank."
            title="Join an Existing School"
            to="/signup/join-school"
          />
        </div>
      </section>
    </main>
  );
}

export default SignupChoicePage;
