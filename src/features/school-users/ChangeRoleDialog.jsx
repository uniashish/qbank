import { useEffect, useRef } from "react";

import Button from "../../components/common/Button.jsx";
import { USER_ROLES } from "../../constants/roles.js";

const ROLE_LABELS = {
  [USER_ROLES.SCHOOL_ADMIN]: "School Admin",
  [USER_ROLES.TEACHER]: "Teacher",
};

function ChangeRoleDialog({ isSaving = false, nextRole, onClose, onConfirm, user }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="school-users-dialog-layer" role="presentation">
      <button
        aria-label="Close change role dialog"
        className="school-users-dialog-backdrop"
        disabled={isSaving}
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="change-role-title"
        aria-modal="true"
        className="school-users-dialog school-users-dialog--narrow"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="school-users-dialog__header">
          <div>
            <p>Change role</p>
            <h2 id="change-role-title">{user.name || user.email}</h2>
            <span>{user.email}</span>
          </div>
          <button
            aria-label="Close change role dialog"
            className="school-users-dialog__close"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <div className="school-users-dialog__body">
          <p className="school-users-confirmation-copy">
            Confirm changing this account from {ROLE_LABELS[user.role]} to{" "}
            {ROLE_LABELS[nextRole]}. This changes the user&apos;s portal access
            immediately.
          </p>
        </div>

        <footer className="school-users-dialog__actions">
          <button
            className="link-button link-button--secondary"
            disabled={isSaving}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <Button isLoading={isSaving} onClick={onConfirm}>
            {isSaving ? "Saving..." : "Confirm Change"}
          </Button>
        </footer>
      </section>
    </div>
  );
}

export default ChangeRoleDialog;
