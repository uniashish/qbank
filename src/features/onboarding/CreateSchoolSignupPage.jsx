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
import { validateSchoolForm } from "../../utils/schoolValidation.js";
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
  createSchoolAdminOnboardingProfile,
  isVerifiedOrGoogleUser,
} from "./onboardingService.js";

const STORAGE_KEY = "qbank:create-school-signup";
const RESEND_COOLDOWN_MS = 45_000;

const initialSchoolValues = {
  address: "",
  city: "",
  code: "",
  country: "",
  email: "",
  name: "",
  phone: "",
  status: SCHOOL_STATUSES.ACTIVE,
};

const initialSchoolErrors = {
  address: "",
  city: "",
  code: "",
  country: "",
  email: "",
  name: "",
  phone: "",
  status: "",
};

function getPendingCreateSignup() {
  return readPendingSignup(STORAGE_KEY);
}

function getInitialSchoolValues() {
  return getPendingCreateSignup()?.schoolValues ?? initialSchoolValues;
}

function getInitialSignupValues() {
  const pendingSignup = getPendingCreateSignup();

  return {
    ...initialSignupValues,
    email: pendingSignup?.accountValues?.email ?? "",
    name: pendingSignup?.accountValues?.name ?? "",
  };
}

function validateAdminName(values, firebaseUser) {
  const errors = { ...initialSignupErrors };
  const name =
    values.name.trim() ||
    firebaseUser?.displayName?.trim() ||
    firebaseUser?.email?.split("@")[0] ||
    "";

  if (!name) {
    errors.name = "Enter your name.";
  }

  return {
    errors,
    isValid: !errors.name,
    values: { name },
  };
}

function CreateSchoolSignupPage() {
  const navigate = useNavigate();
  const { firebaseUser, loading, refreshUserProfile, userProfile } = useAuth();
  const [schoolValues, setSchoolValues] = useState(getInitialSchoolValues);
  const [schoolErrors, setSchoolErrors] = useState(initialSchoolErrors);
  const [accountValues, setAccountValues] = useState(getInitialSignupValues);
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
    firebaseUser && !isVerifiedOrGoogleUser(firebaseUser);
  const canCreateSchool = firebaseUser && isVerifiedOrGoogleUser(firebaseUser);
  const resendCooldownSeconds = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000),
  );

  const startResendCooldown = () => {
    const currentTime = Date.now();

    setNow(currentTime);
    setResendAvailableAt(currentTime + RESEND_COOLDOWN_MS);
  };

  const persistPendingSignup = (nextSchoolValues, nextAccountValues) => {
    savePendingSignup(STORAGE_KEY, {
      accountValues: {
        email: nextAccountValues.email,
        name: nextAccountValues.name,
      },
      schoolValues: nextSchoolValues,
    });
  };

  const handleSchoolChange = (event) => {
    const { name, value } = event.target;

    setSchoolValues((currentValues) => ({ ...currentValues, [name]: value }));
    setSchoolErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setAccountValues((currentValues) => ({ ...currentValues, [name]: value }));
    setAccountErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const completeSchoolCreation = async (credentialUser = firebaseUser) => {
    const schoolValidation = validateSchoolForm(schoolValues);
    const adminValidation = validateAdminName(accountValues, credentialUser);

    setSchoolErrors(schoolValidation.errors);
    setAccountErrors((currentErrors) => ({
      ...currentErrors,
      name: adminValidation.errors.name,
    }));

    if (!schoolValidation.isValid || !adminValidation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before creating the school.",
        type: "error",
      });
      return;
    }

    setActiveAction("complete");
    setFeedback({ message: "", type: "" });

    try {
      await createSchoolAdminOnboardingProfile({
        adminName: adminValidation.values.name,
        firebaseUser: credentialUser,
        school: schoolValidation.values,
      });
      clearPendingSignup(STORAGE_KEY);
      await refreshUserProfile();
      navigate("/school-admin", { replace: true });
    } catch (error) {
      setFeedback({
        message: getOnboardingErrorMessage(
          error,
          "The school could not be created. Try again in a moment.",
        ),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleEmailSignup = async (event) => {
    event.preventDefault();

    if (isProcessing) {
      return;
    }

    const schoolValidation = validateSchoolForm(schoolValues);
    const accountValidation = validateSignupCredentials(accountValues);

    setSchoolErrors(schoolValidation.errors);
    setAccountErrors(accountValidation.errors);

    if (!schoolValidation.isValid || !accountValidation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before creating your account.",
        type: "error",
      });
      return;
    }

    setActiveAction("email");
    setFeedback({ message: "", type: "" });
    persistPendingSignup(schoolValidation.values, accountValidation.values);

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
          "Verification email sent. Verify your email before creating the school.",
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
    if (isProcessing) {
      return;
    }

    const schoolValidation = validateSchoolForm(schoolValues);
    const adminValidation = validateAdminName(accountValues, firebaseUser);

    setSchoolErrors(schoolValidation.errors);
    setAccountErrors((currentErrors) => ({
      ...currentErrors,
      name: adminValidation.errors.name,
    }));

    if (!schoolValidation.isValid || !adminValidation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before continuing with Google.",
        type: "error",
      });
      return;
    }

    setActiveAction("google");
    setFeedback({ message: "", type: "" });
    persistPendingSignup(schoolValidation.values, {
      ...accountValues,
      name: adminValidation.values.name,
    });

    try {
      const credential = await loginWithGoogle();
      await completeSchoolCreation(credential.user);
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

      await completeSchoolCreation(refreshedUser);
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
      <section className="onboarding-card onboarding-card--wide" aria-labelledby="create-school-title">
        <div className="onboarding-card__brand">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <div>
            <p>QBank</p>
            <span>Create School</span>
          </div>
        </div>

        <div className="onboarding-card__intro">
          <p className="onboarding-card__eyebrow">New school signup</p>
          <h1 id="create-school-title">Create a new school</h1>
          <p>
            Set up your school and become its School Admin after your account is
            authenticated.
          </p>
        </div>

        {feedback.message && (
          <div
            className={`school-feedback school-feedback--${feedback.type}`}
            role={feedback.type === "error" ? "alert" : "status"}
          >
            {feedback.message}
          </div>
        )}

        {isWaitingForVerification && (
          <EmailVerificationNotice
            actionDescription="creating your school"
            checkVerificationLabel="Create school"
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

        {canCreateSchool && (
          <div className="onboarding-current-user">
            <p>
              Signed in as <strong>{firebaseUser.email}</strong>
            </p>
            <div className="onboarding-current-user__actions">
              <Button
                disabled={isProcessing}
                isLoading={activeAction === "complete"}
                onClick={() => completeSchoolCreation(firebaseUser)}
              >
                {activeAction === "complete" ? "Creating school..." : "Create school"}
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

        <fieldset className="onboarding-fieldset" disabled={isProcessing}>
          <legend>School details</legend>
          <SchoolSignupFields
            errors={schoolErrors}
            onChange={handleSchoolChange}
            values={schoolValues}
          />
        </fieldset>

        {!firebaseUser && (
          <>
            <fieldset className="onboarding-fieldset" disabled={isProcessing}>
              <legend>Admin details</legend>
              <FormField
                error={accountErrors.name}
                htmlFor="create-school-admin-name"
                label="Full name"
                required
              >
                <input
                  aria-describedby={
                    accountErrors.name
                      ? "create-school-admin-name-error"
                      : undefined
                  }
                  aria-invalid={Boolean(accountErrors.name)}
                  autoComplete="name"
                  className="input"
                  id="create-school-admin-name"
                  name="name"
                  onChange={handleAccountChange}
                  placeholder="Your name"
                  type="text"
                  value={accountValues.name}
                />
              </FormField>
            </fieldset>

            <GoogleSignInButton
              disabled={isProcessing}
              isLoading={activeAction === "google"}
              onClick={handleGoogleSignup}
            />

            <AuthDivider />

            <EmailPasswordSignupForm
              activeAction={activeAction}
              errors={accountErrors}
              idPrefix="create-school-email"
              onChange={handleAccountChange}
              onSubmit={handleEmailSignup}
              showName={false}
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

function SchoolSignupFields({ errors, onChange, values }) {
  return (
    <div className="onboarding-form__grid">
      <FormField
        error={errors.name}
        htmlFor="create-school-name"
        label="School name"
        required
      >
        <input
          aria-describedby={errors.name ? "create-school-name-error" : undefined}
          aria-invalid={Boolean(errors.name)}
          autoComplete="organization"
          className="input"
          id="create-school-name"
          name="name"
          onChange={onChange}
          placeholder="ABC International School"
          type="text"
          value={values.name}
        />
      </FormField>

      <FormField
        error={errors.code}
        helperText="Use a short internal code for reporting and lookup."
        htmlFor="create-school-code"
        label="School code"
        required
      >
        <input
          aria-describedby={errors.code ? "create-school-code-error" : undefined}
          aria-invalid={Boolean(errors.code)}
          autoComplete="off"
          className="input"
          id="create-school-code"
          name="code"
          onChange={onChange}
          placeholder="ABC001"
          type="text"
          value={values.code}
        />
      </FormField>

      <FormField
        error={errors.email}
        htmlFor="create-school-email-address"
        label="School email"
      >
        <input
          aria-describedby={
            errors.email ? "create-school-email-address-error" : undefined
          }
          aria-invalid={Boolean(errors.email)}
          autoComplete="email"
          className="input"
          id="create-school-email-address"
          name="email"
          onChange={onChange}
          placeholder="admin@abcschool.com"
          type="email"
          value={values.email}
        />
      </FormField>

      <FormField
        error={errors.phone}
        htmlFor="create-school-phone"
        label="Phone"
      >
        <input
          aria-describedby={errors.phone ? "create-school-phone-error" : undefined}
          aria-invalid={Boolean(errors.phone)}
          autoComplete="tel"
          className="input"
          id="create-school-phone"
          name="phone"
          onChange={onChange}
          placeholder="+1 555 0100"
          type="tel"
          value={values.phone}
        />
      </FormField>

      <FormField
        error={errors.address}
        htmlFor="create-school-address"
        label="Address"
      >
        <input
          aria-describedby={
            errors.address ? "create-school-address-error" : undefined
          }
          aria-invalid={Boolean(errors.address)}
          autoComplete="address-line1"
          className="input"
          id="create-school-address"
          name="address"
          onChange={onChange}
          placeholder="Street address"
          type="text"
          value={values.address}
        />
      </FormField>

      <FormField
        error={errors.city}
        htmlFor="create-school-city"
        label="City"
      >
        <input
          aria-describedby={errors.city ? "create-school-city-error" : undefined}
          aria-invalid={Boolean(errors.city)}
          autoComplete="address-level2"
          className="input"
          id="create-school-city"
          name="city"
          onChange={onChange}
          placeholder="City"
          type="text"
          value={values.city}
        />
      </FormField>

      <FormField
        error={errors.country}
        htmlFor="create-school-country"
        label="Country"
      >
        <input
          aria-describedby={
            errors.country ? "create-school-country-error" : undefined
          }
          aria-invalid={Boolean(errors.country)}
          autoComplete="country-name"
          className="input"
          id="create-school-country"
          name="country"
          onChange={onChange}
          placeholder="Country"
          type="text"
          value={values.country}
        />
      </FormField>
    </div>
  );
}

export default CreateSchoolSignupPage;
