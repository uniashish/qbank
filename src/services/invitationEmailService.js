export async function sendInvitationEmail({ invitationId, schoolId }, firebaseUser) {
  if (!firebaseUser) {
    throw new Error("Sign in before sending an invitation email.");
  }

  const idToken = await firebaseUser.getIdToken();
  const response = await fetch("/api/send-invitation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invitationId,
      schoolId,
    }),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.success) {
    throw new Error(
      payload?.error || "Invitation email could not be sent.",
    );
  }

  return payload;
}
