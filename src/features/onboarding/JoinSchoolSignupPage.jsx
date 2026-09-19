import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import AuthDivider from "../../components/auth/AuthDivider.jsx";
import GoogleSignInButton from "../../components/auth/GoogleSignInButton.jsx";
import Button from "../../components/common/Button.jsx";
import FormField from "../../components/common/FormField.jsx";
import FullPageLoader from "../../components/common/FullPageLoader.jsx";
import EmailVerificationNotice from "../../components/invitations/EmailVerificationNotice.jsx";
import { SCHOOL_STATUSES } from "../../constants/schoolStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import { loginWithGoogle, logout, registerWithEmail } from "../../services/authService.js";
import {
  reloadCurrentUser,
  sendVerificationEmail,
} from "../../services/emailVerificationService.js";
import { getRouteForUserProfile } from "../../utils/getRouteForUserProfile.js";
import EmailPasswordSignupForm from "./EmailPasswordSignupForm.jsx";
import {
  clearPendingSignup,
  getOnboardingErrorMessage,
  initialSignupErrors,
  initialSignupValues,
  readPendingSignup,
  savePendingSignup,
  validateSignupCredentials,
} from "./onboardingFormUtils.js";
import {
  createSchoolJoinRequest,
  findSchoolByExactName,
  isVerifiedOrGoogleUser,
} from "./onboardingService.js";

const STORAGE_KEY = "qbank:join-school-signup";
const RESEND_COOLDOWN_MS = 45_000;
const SCHOOL_NOT_FOUND_MESSAGE =
  "School not found. Check the school name and try again.";
const SCHOOL_NOT_ACCEPTING_MESSAGE =
  "This school is not accepting join requests.";

function getPendingJoinSignup() {
  return readPendingSignup(STORAGE_KEY);
}

function getInitialAccountValues() {
  const pendingSignup = getPendingJoinSignup();

  return {
    ...initialSignupValues,
    email: pendingSignup?.accountValues?.email ?? "",
    name: pendingSignup?.accountValues?.name ?? "",
  };
}

function getInitialMatchedSchool() {
  return getPendingJoinSignup()?.school ?? null;
}

function JoinSchoolSignupPage() {
  const navigate = useNavigate();
  const { firebaseUser, loading, refreshUserProfile, userProfile } = useAuth();
  const [schoolName, setSchoolName] = useState(
    () => getInitialMatchedSchool()?.name ?? "",
  );
  const [schoolNameError, setSchoolNameError] = useState("");
  const [matchedSchool, setMatchedSchool] = useState(getInitialMatchedSchool);
  const [accountValues, setAccountValues] = useState(getInitialAccountValues);
  const [accountErrors, setAccountErrors] = useState(initialSignupErrors);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [activeAction, setActiveAction] = useState("idle");
  const [hasSentVerificationEmail, setHasSentVerificationEmail] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (!resendAvailableAt) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();

      setNow(currentTime);

      if (currentTime >= resendAvailableAt) {
        window.clearInterval(intervalId);
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [resendAvailableAt]);

  if (loading) {
    return <FullPageLoader label="Loading signup" />;
  }

  if (userProfile) {
    return <Navigate replace to={getRouteForUserProfile(userProfile)} />;
  }

  const isProcessing = activeAction !== "idle";
  const isWaitingForVerification =
    firebaseUser && matchedSchool && !isVerifiedOrGoogleUser(firebaseUser);
  const canSubmitJoinRequest =
    firebaseUser && matchedSchool && isVerifiedOrGoogleUser(firebaseUser);
  const resendCooldownSeconds = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000),
  );

  const startResendCooldown = () => {
    const currentTime = Date.now();

    setNow(currentTime);
    setResendAvailableAt(currentTime + RESEND_COOLDOWN_MS);
  };

  const persistPendingSignup = (school, nextAccountValues) => {
    savePendingSignup(STORAGE_KEY, {
      accountValues: {
        email: nextAccountValues.email,
        name: nextAccountValues.name,
      },
      school,
    });
  };

  const setMatchedSchoolIfAccepting = (school) => {
    if (!school) {
      setMatchedSchool(null);
      setFeedback({ message: SCHOOL_NOT_FOUND_MESSAGE, type: "error" });
      return false;
    }

    if (
      school.allowJoinRequests === false ||
      school.status !== SCHOOL_STATUSES.ACTIVE
    ) {
      setMatchedSchool(null);
      setFeedback({ message: SCHOOL_NOT_ACCEPTING_MESSAGE, type: "error" });
      return false;
    }

    setMatchedSchool(school);
    persistPendingSignup(school, accountValues);
    setFeedback({
      message: "School found. Continue with an account to request access.",
      type: "success",
    });
    return true;
  };

  const handleFindSchool = async (event) => {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    if (!schoolName.trim()) {
      setSchoolNameError("Enter the exact school name.");
      setFeedback({ message: "Enter the exact school name.", type: "error" });
      return;
    }

    setActiveAction("lookup");
    setSchoolNameError("");
    setFeedback({ message: "", type: "" });

    try {
      const school = await findSchoolByExactName(schoolName);
      setMatchedSchoolIfAccepting(school);
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "School lookup failed. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setAccountValues((currentValues) => ({ ...currentValues, [name]: value }));
    setAccountErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const completeJoinRequest = async (credentialUser = firebaseUser) => {
    if (!matchedSchool) {
      setFeedback({
        message: "Enter and confirm your school name before continuing.",
        type: "error",
      });
      return;
    }

    setActiveAction("complete");
    setFeedback({ message: "", type: "" });

    try {
      const requestId = await createSchoolJoinRequest({
        firebaseUser: credentialUser,
        requesterName: accountValues.name,
        school: matchedSchool,
      });

      clearPendingSignup(STORAGE_KEY);
      setFeedback({
        message: "Join request submitted.",
        type: "success",
      });
      await refreshUserProfile();
      navigate("/teacher", {
        replace: true,
        state: { joinRequestId: requestId },
      });
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "The join request could not be submitted. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleEmailSignup = async (event) => {
    event.preventDefault();

    if (isProcessing || !matchedSchool) {
      return;
    }

    const accountValidation = validateSignupCredentials(accountValues);

    setAccountErrors(accountValidation.errors);

    if (!accountValidation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before creating your account.",
        type: "error",
      });
      return;
    }

    setActiveAction("email");
    setFeedback({ message: "", type: "" });
    persistPendingSignup(matchedSchool, accountValidation.values);

    let accountWasCreated = false;

    try {
      const credential = await registerWithEmail(
        accountValidation.values.email,
        accountValidation.values.password,
        accountValidation.values.name,
      );

      accountWasCreated = true;
      await sendVerificationEmail(credential.user);
      startResendCooldown();
      setHasSentVerificationEmail(true);
      setAccountValues((currentValues) => ({
        ...currentValues,
        confirmPassword: "",
        password: "",
      }));
      setFeedback({
        message:
          "Verification email sent. Verify your email before submitting the join request.",
        type: "success",
      });
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          accountWasCreated
            ? "Account created, but the verification email could not be sent."
            : "The account could not be created. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleGoogleSignup = async () => {
    if (isProcessing || !matchedSchool) {
      return;
    }

    setActiveAction("google");
    setFeedback({ message: "", type: "" });
    persistPendingSignup(matchedSchool, accountValues);

    try {
      const credential = await loginWithGoogle();
      await completeJoinRequest(credential.user);
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "Google signup could not be completed. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleCheckVerification = async () => {
    if (isProcessing) {
      return;
    }

    setActiveAction("check");
    setFeedback({ message: "", type: "" });

    try {
      const refreshedUser = await reloadCurrentUser();

      if (!refreshedUser.emailVerified) {
        setFeedback({
          message:
            "Email verification is still pending. Open the verification link, then try again.",
          type: "error",
        });
        return;
      }

      await completeJoinRequest(refreshedUser);
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "Email verification could not be checked. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleResendVerification = async () => {
    if (isProcessing) {
      return;
    }

    setActiveAction("resend");
    setFeedback({ message: "", type: "" });

    try {
      await sendVerificationEmail(firebaseUser);
      startResendCooldown();
      setHasSentVerificationEmail(true);
      setFeedback({ message: "Verification email resent.", type: "success" });
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "Verification email could not be sent. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleSignOut = async () => {
    setFeedback({ message: "", type: "" });
    await logout();
  };

  return (
    <main className="onboarding-page">
      <section className="onboarding-card" aria-labelledby="join-school-title">
        <div className="onboarding-card__brand">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <div>
            <p>QBank</p>
            <span>Join School</span>
          </div>
        </div>

        <div className="onboarding-card__intro">
          <p className="onboarding-card__eyebrow">Existing school signup</p>
          <h1 id="join-school-title">Join an existing school</h1>
          <p>Enter the exact school name provided by your school.</p>
        </div>

        {feedback.message && (
          <div
            className={`school-feedback school-feedback--${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </div>
        )}

        <form className="onboarding-form" noValidate onSubmit={handleFindSchool}>
          <FormField
            error={schoolNameError}
            htmlFor="join-school-name"
            label="Enter the exact school name"
            required
          >
            <input
              aria-describedby={
                schoolNameError ? "join-school-name-error" : undefined
              }
              aria-invalid={Boolean(schoolNameError)}
              autoComplete="organization"
              className="input"
              disabled={isProcessing}
              id="join-school-name"
              name="schoolName"
              onChange={(event) => {
                setSchoolName(event.target.value);
                setSchoolNameError("");
                setMatchedSchool(null);
                clearPendingSignup(STORAGE_KEY);
              }}
              placeholder="School name"
              type="text"
              value={schoolName}
            />
          </FormField>
          <Button isLoading={activeAction === "lookup"} type="submit">
            {activeAction === "lookup" ? "Checking..." : "Continue"}
          </Button>
        </form>

        {matchedSchool && (
          <div className="onboarding-match-panel">
            <span>Matched school</span>
            <strong>{matchedSchool.name}</strong>
          </div>
        )}

        {isWaitingForVerification && (
          <EmailVerificationNotice
            actionDescription="submitting your join request"
            checkVerificationLabel="Submit join request"
            cooldownSeconds={resendCooldownSeconds}
            email={firebaseUser.email}
            hasSentVerificationEmail={hasSentVerificationEmail}
            isChecking={activeAction === "check"}
            isProcessing={isProcessing}
            isResending={activeAction === "resend"}
            onCheckVerification={handleCheckVerification}
            onResendVerification={handleResendVerification}
            onSignOut={handleSignOut}
          />
        )}

        {canSubmitJoinRequest && (
          <div className="onboarding-current-user">
            <p>
              Signed in as <strong>{firebaseUser.email}</strong>
            </p>
            <div className="onboarding-current-user__actions">
              <Button
                disabled={isProcessing}
                isLoading={activeAction === "complete"}
                onClick={() => completeJoinRequest(firebaseUser)}
              >
                {activeAction === "complete"
                  ? "Submitting..."
                  : "Submit join request"}
              </Button>
              <button
                className="link-button link-button--secondary"
                disabled={isProcessing}
                onClick={handleSignOut}
                type="button"
              >
                Use another account
              </button>
            </div>
          </div>
        )}

        {matchedSchool && !firebaseUser && (
          <>
            <GoogleSignInButton
              disabled={isProcessing}
              isLoading={activeAction === "google"}
              onClick={handleGoogleSignup}
            />

            <AuthDivider />

            <EmailPasswordSignupForm
              activeAction={activeAction}
              errors={accountErrors}
              idPrefix="join-school-email"
              onChange={handleAccountChange}
              onSubmit={handleEmailSignup}
              submitLabel="Create Account"
              submittingLabel="Creating account..."
              values={accountValues}
            />
          </>
        )}

        <Link className="placeholder-link" to="/signup">
          Back to signup choices
        </Link>
      </section>
    </main>
  );
}

export default JoinSchoolSignupPage;
