const GOOGLE_DOCS_EXPORT_MESSAGE_TYPE = "qbank-google-docs-export";

function createGoogleDocsExportError(message, docs = []) {
  const error = new Error(message);
  error.docs = docs;

  return error;
}

async function readApiError(response) {
  try {
    const payload = await response.json();

    return payload?.error || "Google Docs export could not be started.";
  } catch {
    return "Google Docs export could not be started.";
  }
}

function openExportPopup() {
  const popup = window.open(
    "",
    "qbank-google-docs-export",
    "popup=yes,width=520,height=720",
  );

  if (!popup) {
    throw createGoogleDocsExportError(
      "Allow popups to connect Google Docs export.",
    );
  }

  popup.document.write(
    "<!doctype html><title>Google Docs Export</title><p>Preparing Google Docs export...</p>",
  );

  return popup;
}

function waitForGoogleDocsExportResult(popup, authorizationUrl) {
  return new Promise((resolve, reject) => {
    let isSettled = false;

    function settle(callback, value) {
      if (isSettled) {
        return;
      }

      isSettled = true;
      window.removeEventListener("message", handleMessage);
      window.clearInterval(closeWatcher);
      callback(value);
    }

    function handleMessage(event) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type !== GOOGLE_DOCS_EXPORT_MESSAGE_TYPE) {
        return;
      }

      if (event.data.success) {
        settle(resolve, event.data.docs ?? []);
        return;
      }

      settle(
        reject,
        createGoogleDocsExportError(
          event.data.error || "Google Docs export failed.",
          event.data.docs ?? [],
        ),
      );
    }

    const closeWatcher = window.setInterval(() => {
      if (popup.closed) {
        settle(
          reject,
          createGoogleDocsExportError(
            "Google Docs permission was not completed.",
          ),
        );
      }
    }, 500);

    window.addEventListener("message", handleMessage);
    popup.location.href = authorizationUrl;
  });
}

export async function exportQuestionPaperGoogleDocs({
  answerKeyOptions,
  firebaseUser,
  paperId,
} = {}) {
  if (!firebaseUser) {
    throw createGoogleDocsExportError("Sign in before exporting to Google Docs.");
  }

  if (!paperId) {
    throw createGoogleDocsExportError("Choose a finalized paper to export.");
  }

  const popup = openExportPopup();

  try {
    const idToken = await firebaseUser.getIdToken();
    const response = await fetch("/api/export-question-paper-google-doc", {
      body: JSON.stringify({
        answerKeyOptions,
        paperId,
      }),
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const errorMessage = await readApiError(response);
      popup.close();
      throw createGoogleDocsExportError(errorMessage);
    }

    const payload = await response.json();

    if (!payload.authorizationUrl) {
      popup.close();
      throw createGoogleDocsExportError(
        "Google Docs export authorization could not be started.",
      );
    }

    return await waitForGoogleDocsExportResult(
      popup,
      payload.authorizationUrl,
    );
  } catch (error) {
    if (!popup.closed) {
      popup.close();
    }

    throw error;
  }
}
