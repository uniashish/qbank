import { useEffect, useRef } from "react";

import { formatDate } from "../../utils/formatDate.js";

function UserDetailsDialog({ onClose, user }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  return (
    <div className="school-users-dialog-layer" role="presentation">
      <button
        aria-label="Close user details"
        className="school-users-dialog-backdrop"
        onClick={onClose}
        type="button"
      />
      <section
        aria-labelledby="user-details-title"
        aria-modal="true"
        className="school-users-dialog school-users-dialog--narrow"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="school-users-dialog__header">
          <div>
            <p>User details</p>
            <h2 id="user-details-title">{user.name || user.email}</h2>
            <span>{user.email}</span>
          </div>
          <button
            aria-label="Close user details"
            className="school-users-dialog__close"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </header>

        <dl className="school-users-details-list">
          <div>
            <dt>Role</dt>
            <dd>{user.role}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{user.status}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd>{user.uid}</dd>
          </div>
          <div>
            <dt>Created</dt>
            <dd>{formatDate(user.createdAt)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}

export default UserDetailsDialog;
