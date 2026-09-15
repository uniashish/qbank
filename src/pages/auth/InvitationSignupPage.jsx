import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import EmailVerificationNotice from "../../components/invitations/EmailVerificationNotice.jsx";
import InviteSignupForm from "../../components/invitations/InviteSignupForm.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import { INVITATION_STATUSES } from "../../constants/invitationStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  loginWithGoogle,
  logout,
  registerWithEmail,
} from "../../services/authService.js";
import {
  getInvitationByToken,
  isInvitationExpired,
} from "../../services/invitationService.js";
import {
  INVITATION_REDEMPTION_ERROR_CODES,
  redeemInvitation,
} from "../../services/invitationRedemptionService.js";
import {
  EMAIL_VERIFICATION_ERROR_CODES,
  reloadCurrentUser,
  requireVerifiedCurrentUser,
  sendVerificationEmail,
} from "../../services/emailVerificationService.js";
import { getAuthErrorMessage } from "../../utils/authErrors.js";
import { getDefaultRouteForRole } from "../../utils/getDefaultRouteForRole.js";
import { getRoleLabel } from "../../utils/getRoleLabel.js";

const RESEND_COOLDOWN_MS = 45_000;

const initialValues = {
  confirmPassword: "",
  password: "",
};

const initialErrors = {
  confirmPassword: "",
  password: "",
};

function emailsMatch(firstEmail, secondEmail) {
  return firstEmail?.trim().toLowerCase() === secondEmail?.trim().toLowerCase();
}

function getInvitationState(invitation) {
  if (!invitation) {
    return {
      description: "This invitation could not be found.",
      title: "Invitation not found",
    };
  }

  if (invitation.status === INVITATION_STATUSES.ACCEPTED) {
    return {
      description: "This invitation has already been used.",
      title: "Invitation already used",
    };
  }

  if (invitation.status === INVITATION_STATUSES.CANCELLED) {
    return {
      description: "This invitation was cancelled by a Platform Admin.",
      title: "Invitation cancelled",
    };
  }

  if (
    invitation.status === INVITATION_STATUSES.EXPIRED ||
    isInvitationExpired(invitation)
  ) {
    return {
      description: "This invitation has expired. Contact your school admin.",
      title: "Invitation expired",
    };
  }

  if (invitation.status !== INVITATION_STATUSES.PENDING) {
    return {
      description: "This invitation is no longer available.",
      title: "Invitation unavailable",
    };
  }

  return null;
}

function validateSignupForm(values) {
  const errors = { ...initialErrors };

  if (!values.password) {
    errors.password = "Create a password.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
  };
}

function isAuthError(error) {
  return typeof error?.code === "string" && error.code.startsWith("auth/");
}

function getInviteActionErrorMessage(error) {
  if (isAuthError(error)) {
    return getAuthErrorMessage(error);
  }

  if (error?.code === INVITATION_REDEMPTION_ERROR_CODES.EMAIL_MISMATCH) {
    return "Sign in with the email address this invitation was sent to.";
  }

  if (
    error?.code === INVITATION_REDEMPTION_ERROR_CODES.EMAIL_NOT_VERIFIED ||
    error?.code === EMAIL_VERIFICATION_ERROR_CODES.EMAIL_NOT_VERIFIED
  ) {
    return "Verify your email address before accepting this invitation.";
  }

  return (
    error?.message || "This invitation could not be redeemed. Try again in a moment."
  );
}

function getFirebaseErrorDetails(error) {
  return [error?.code, error?.message].filter(Boolean).join(": ");
}

function getVerificationEmailErrorMessage(error, { accountWasCreated = false } = {}) {
  const firebaseDetails = getFirebaseErrorDetails(error);
  const prefix = accountWasCreated
    ? "Account created, but Firebase could not send the verification email."
    : "Firebase could not send the verification email.";

  return firebaseDetails
    ? `${prefix} ${firebaseDetails}`
    : `${prefix} Try again in a moment.`;
}

function logInviteActionError(action, error) {
  console.error(
    `[Invitation signup] ${action} failed.`,
    {
      code: error?.code,
      message: error?.message,
      redemptionContext: error?.redemptionContext,
    },
    error,
  );
}

function InvitationSignupPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { firebaseUser, loading, refreshUserProfile } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [isLoadingInvitation, setIsLoadingInvitation] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [activeAction, setActiveAction] = useState("idle");
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [hasSentVerificationEmail, setHasSentVerificationEmail] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [now, setNow] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadInvitation() {
      setIsLoadingInvitation(true);
      setPageError("");

      try {
        const invitationRecord = await getInvitationByToken(token);

        if (isMounted) {
          setInvitation(invitationRecord);
        }
      } catch (error) {
        logInviteActionError("load invitation", error);

        if (isMounted) {
          setPageError("This invitation could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingInvitation(false);
        }
      }
    }

    loadInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

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

  const startResendCooldown = () => {
    const currentTime = Date.now();

    setNow(currentTime);
    setResendAvailableAt(currentTime + RESEND_COOLDOWN_MS);
  };

  const finishRedemption = async (credentialUser) => {
    setFeedback({
      message: "Verification confirmed. Redeeming invitation...",
      type: "success",
    });
    await redeemInvitation(invitation, credentialUser);
    setFeedback({ message: "Invitation accepted.", type: "success" });
    const userProfile = await refreshUserProfile();
    navigate(getDefaultRouteForRole(userProfile?.role ?? invitation.role), {
      replace: true,
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleEmailSignup = async (event) => {
    event.preventDefault();

    if (activeAction !== "idle") {
      return;
    }

    const validation = validateSignupForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before creating your account.",
        type: "error",
      });
      return;
    }

    setActiveAction("email");
    setFeedback({ message: "", type: "" });

    let accountWasCreated = false;

    try {
      const credential = await registerWithEmail(
        invitation.email,
        values.password,
        invitation.name,
      );
      accountWasCreated = true;
      await sendVerificationEmail(credential.user);
      startResendCooldown();
      setHasSentVerificationEmail(true);
      setValues(initialValues);
      setErrors(initialErrors);
      setFeedback({
        message: "Verification email sent. Open the link before accepting this invitation.",
        type: "success",
      });
    } catch (error) {
      logInviteActionError(
        accountWasCreated
          ? "send verification email"
          : "create invited email account",
        error,
      );

      setFeedback({
        message: accountWasCreated
          ? getVerificationEmailErrorMessage(error, { accountWasCreated })
          : getInviteActionErrorMessage(error),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleGoogleSignup = async () => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("google");
    setFeedback({ message: "", type: "" });

    try {
      const credential = await loginWithGoogle();

      if (!emailsMatch(credential.user.email, invitation.email)) {
        await logout();
        setFeedback({
          message: "Use the Google account that matches the invited email.",
          type: "error",
        });
        return;
      }

      const verifiedUser = await requireVerifiedCurrentUser();
      await finishRedemption(verifiedUser);
    } catch (error) {
      logInviteActionError("Google invitation redemption", error);

      setFeedback({
        message: getInviteActionErrorMessage(error),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleRedeemCurrentUser = async () => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("current");
    setFeedback({ message: "", type: "" });

    try {
      if (!emailsMatch(firebaseUser.email, invitation.email)) {
        setFeedback({
          message: "Sign out and use the email address this invitation was sent to.",
          type: "error",
        });
        return;
      }

      const verifiedUser = await requireVerifiedCurrentUser();
      await finishRedemption(verifiedUser);
    } catch (error) {
      logInviteActionError("current-user invitation redemption", error);

      setFeedback({
        message: getInviteActionErrorMessage(error),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleCheckVerification = async () => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("check");
    setFeedback({ message: "", type: "" });

    try {
      const refreshedUser = await reloadCurrentUser();

      if (!emailsMatch(refreshedUser.email, invitation.email)) {
        setFeedback({
          message: "Sign out and use the email address this invitation was sent to.",
          type: "error",
        });
        return;
      }

      if (!refreshedUser.emailVerified) {
        setFeedback({
          message:
            "Email verification is still pending. Open the verification link, then try again.",
          type: "error",
        });
        return;
      }

      await finishRedemption(refreshedUser);
    } catch (error) {
      logInviteActionError("email verification check", error);

      setFeedback({
        message: getInviteActionErrorMessage(error),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleResendVerification = async () => {
    if (activeAction !== "idle") {
      return;
    }

    setActiveAction("resend");
    setFeedback({ message: "", type: "" });

    try {
      if (!firebaseUser || !emailsMatch(firebaseUser.email, invitation.email)) {
        setFeedback({
          message: "Sign in with the email address this invitation was sent to.",
          type: "error",
        });
        return;
      }

      await sendVerificationEmail(firebaseUser);
      startResendCooldown();
      setHasSentVerificationEmail(true);
      setFeedback({
        message: "Verification email resent.",
        type: "success",
      });
    } catch (error) {
      logInviteActionError("resend verification email", error);

      setFeedback({
        message: getVerificationEmailErrorMessage(error),
        type: "error",
      });
    } finally {
      setActiveAction("idle");
    }
  };

  const handleSignOut = async () => {
    setFeedback({ message: "", type: "" });
    setHasSentVerificationEmail(false);
    await logout();
  };

  const invitationState = getInvitationState(invitation);
  const isLoading = loading || isLoadingInvitation;
  const invitationRoleLabel = invitation ? getRoleLabel(invitation.role) : "";
  const isProcessing = activeAction !== "idle";
  const signedInEmailMatchesInvitation =
    firebaseUser && invitation && emailsMatch(firebaseUser.email, invitation.email);
  const isWaitingForVerification =
    firebaseUser &&
    invitation &&
    signedInEmailMatchesInvitation &&
    !firebaseUser.emailVerified;
  const resendCooldownSeconds = Math.max(
    0,
    Math.ceil((resendAvailableAt - now) / 1000),
  );

  return (
    <main className="invite-page">
      <section className="invite-card" aria-labelledby="invite-title">
        <div className="invite-card__brand">
          <span className="brand-mark" aria-hidden="true">
            QB
          </span>
          <div>
            <p>QBank</p>
            <span>
              {invitationRoleLabel ? `${invitationRoleLabel} Invitation` : "Invitation"}
            </span>
          </div>
        </div>

        {isLoading && (
          <div className="invite-state" aria-live="polite">
            <Spinner label="Loading invitation" />
            <p>Loading invitation...</p>
          </div>
        )}

        {!isLoading && pageError && (
          <div className="invite-state invite-state--error" role="alert">
            <h1 id="invite-title">Invitation unavailable</h1>
            <p>{pageError}</p>
          </div>
        )}

        {!isLoading && !pageError && invitationState && (
          <div className="invite-state">
            <h1 id="invite-title">{invitationState.title}</h1>
            <p>{invitationState.description}</p>
            <Link className="placeholder-link" to="/login">
              Back to sign in
            </Link>
          </div>
        )}

        {!isLoading && !pageError && !invitationState && (
          <>
            <div className="invite-card__intro">
              <p className="invite-card__eyebrow">{invitation.schoolName}</p>
              <h1 id="invite-title">Create your {invitationRoleLabel} account</h1>
              <p>
                You were invited as {invitation.name}. Use{" "}
                <strong>{invitation.email}</strong> to accept this invitation.
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

            {firebaseUser && !signedInEmailMatchesInvitation && (
              <div className="invite-current-user invite-current-user--mismatch">
                <p>
                  Signed in as <strong>{firebaseUser.email}</strong>
                </p>
                <p>
                  This invitation is for <strong>{invitation.email}</strong>.
                </p>
                <div className="invite-current-user__actions">
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

            {isWaitingForVerification && (
              <EmailVerificationNotice
                cooldownSeconds={resendCooldownSeconds}
                email={invitation.email}
                hasSentVerificationEmail={hasSentVerificationEmail}
                isChecking={activeAction === "check"}
                isProcessing={isProcessing}
                isResending={activeAction === "resend"}
                onCheckVerification={handleCheckVerification}
                onResendVerification={handleResendVerification}
                onSignOut={handleSignOut}
              />
            )}

            {firebaseUser &&
            signedInEmailMatchesInvitation &&
            !isWaitingForVerification ? (
              <div className="invite-current-user">
                <p>
                  Signed in as <strong>{firebaseUser.email}</strong>
                </p>
                <div className="invite-current-user__actions">
                  <button
                    className="link-button link-button--primary"
                    disabled={activeAction !== "idle"}
                    onClick={handleRedeemCurrentUser}
                    type="button"
                  >
                    {activeAction === "current"
                      ? "Accepting..."
                      : "Accept Invitation"}
                  </button>
                  <button
                    className="link-button link-button--secondary"
                    disabled={activeAction !== "idle"}
                    onClick={handleSignOut}
                    type="button"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : null}

            {!firebaseUser && (
              <InviteSignupForm
                activeAction={activeAction}
                errors={errors}
                invitationEmail={invitation.email}
                onChange={handleChange}
                onGoogleSignup={handleGoogleSignup}
                onSubmit={handleEmailSignup}
                values={values}
              />
            )}
          </>
        )}
      </section>
    </main>
  );
}

export default InvitationSignupPage;
