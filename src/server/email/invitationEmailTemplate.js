function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatExpiration(expiresAt) {
  if (!expiresAt) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(expiresAt);
}

function getRoleLabel(role) {
  return role === "school_admin" ? "School Admin" : "Unknown Role";
}

export function createInvitationEmailTemplate({
  invitation,
  invitationUrl,
  school,
}) {
  const inviteeName = invitation.name || "there";
  const schoolName = school.name || invitation.schoolName || "your school";
  const roleLabel = getRoleLabel(invitation.role);
  const expiration = formatExpiration(invitation.expiresAtDate);
  const expirationText = expiration
    ? `This invitation expires on ${expiration} UTC.`
    : "This invitation expires soon.";
  const subject = `You're invited to QBank for ${schoolName}`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f8fafc;color:#0f172a;font-family:Arial,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;padding:28px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;">QBank Invitation</p>
                <h1 style="margin:0 0 16px;color:#0f172a;font-size:24px;line-height:1.25;">You're invited to ${escapeHtml(schoolName)}</h1>
                <p style="margin:0 0 14px;color:#334155;font-size:16px;line-height:1.6;">Hi ${escapeHtml(inviteeName)},</p>
                <p style="margin:0 0 20px;color:#334155;font-size:16px;line-height:1.6;">You have been invited to join ${escapeHtml(schoolName)} as a ${escapeHtml(roleLabel)} on QBank.</p>
                <p style="margin:0 0 24px;">
                  <a href="${escapeHtml(invitationUrl)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Accept Invitation</a>
                </p>
                <p style="margin:0 0 10px;color:#64748b;font-size:14px;line-height:1.6;">${escapeHtml(expirationText)}</p>
                <p style="margin:0;color:#64748b;font-size:14px;line-height:1.6;">If the button does not work, copy and paste this link into your browser:<br><a href="${escapeHtml(invitationUrl)}" style="color:#2563eb;">${escapeHtml(invitationUrl)}</a></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hi ${inviteeName},`,
    "",
    `You have been invited to join ${schoolName} as a ${roleLabel} on QBank.`,
    "",
    `Accept invitation: ${invitationUrl}`,
    "",
    expirationText,
  ].join("\n");

  return {
    html,
    subject,
    text,
  };
}
