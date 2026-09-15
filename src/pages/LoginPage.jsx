import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import AuthCard from "../components/auth/AuthCard.jsx";
import FullPageLoader from "../components/common/FullPageLoader.jsx";
import { useAuth } from "../hooks/useAuth.js";
import {
  loginWithEmail,
  loginWithGoogle,
  sendPasswordReset,
} from "../services/authService.js";
import { getUserProfile } from "../services/userService.js";
import { getAuthErrorMessage } from "../utils/authErrors.js";
import { getRouteForUserProfile } from "../utils/getRouteForUserProfile.js";

const initialFeedback = { type: "", message: "" };

function LoginPage() {
  const navigate = useNavigate();
  const { loading, userProfile } = useAuth();
  const [activeAction, setActiveAction] = useState("idle");
  const [feedback, setFeedback] = useState(initialFeedback);

  if (loading) {
    return <FullPageLoader label="Loading sign in" />;
  }

  if (userProfile) {
    return <Navigate to={getRouteForUserProfile(userProfile)} replace />;
  }

  const redirectAfterLogin = async (credential) => {
    const profile = await getUserProfile(credential.user.uid);
    navigate(getRouteForUserProfile(profile), { replace: true });
  };

  const handleEmailLogin = async ({ email, password }) => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("email");
    setFeedback(initialFeedback);

    try {
      const credential = await loginWithEmail(email, password);
      await redirectAfterLogin(credential);
    } catch (error) {
      setFeedback({ type: "error", message: getAuthErrorMessage(error) });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleGoogleLogin = async () => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("google");
    setFeedback(initialFeedback);

    try {
      const credential = await loginWithGoogle();
      await redirectAfterLogin(credential);
    } catch (error) {
      setFeedback({ type: "error", message: getAuthErrorMessage(error) });
    } finally {
      setActiveAction("idle");
    }
  };

  const handlePasswordReset = async (email) => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("reset");
    setFeedback(initialFeedback);

    try {
      await sendPasswordReset(email);
      setFeedback({
        type: "success",
        message: "Password reset instructions have been sent to your email.",
      });
    } catch (error) {
      setFeedback({ type: "error", message: getAuthErrorMessage(error) });
    } finally {
      setActiveAction("idle");
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-brand-panel" aria-label="QBank overview">
        <div className="auth-brand-panel__content">
          <div className="auth-brand-panel__brand">
            <span className="brand-mark brand-mark--large" aria-hidden="true">
              QB
            </span>
            <span>QBank</span>
          </div>
          <div className="auth-brand-panel__copy">
            <p className="auth-brand-panel__eyebrow">For modern schools</p>
            <h2>
              Build better exams.
              <br />
              Faster.
            </h2>
            <p>
              Create, organize, and generate high-quality exam papers from one
              intelligent question bank.
            </p>
          </div>
          <ul className="auth-benefits" aria-label="QBank benefits">
            <li>
              <BenefitIcon />
              <span>Organize questions by subject and topic</span>
            </li>
            <li>
              <BenefitIcon />
              <span>Generate balanced exam papers</span>
            </li>
            <li>
              <BenefitIcon />
              <span>Save hours of repetitive preparation</span>
            </li>
          </ul>
        </div>
        <div className="auth-visual" aria-hidden="true">
          <div className="auth-visual__sheet auth-visual__sheet--primary">
            <span />
            <span />
            <span />
          </div>
          <div className="auth-visual__sheet auth-visual__sheet--secondary">
            <span />
            <span />
          </div>
          <div className="auth-visual__score">98%</div>
        </div>
      </section>

      <section className="auth-panel" aria-label="Sign in">
        <AuthCard
          activeAction={activeAction}
          feedback={feedback}
          onEmailLogin={handleEmailLogin}
          onGoogleLogin={handleGoogleLogin}
          onPasswordReset={handlePasswordReset}
          onValidationError={(message) =>
            setFeedback({ type: "error", message })
          }
        />
      </section>
    </main>
  );
}

function BenefitIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      viewBox="0 0 24 24"
      width="18"
    >
      <path
        d="m5 12 4 4L19 6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export default LoginPage;
