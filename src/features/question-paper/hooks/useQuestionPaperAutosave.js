import { useEffect, useRef } from "react";

export function useQuestionPaperAutosave({
  debounceMs = 1500,
  draftFingerprint,
  enabled,
  isSaving,
  lastSavedFingerprint,
  onAutosave,
  saveStatusState,
}) {
  const onAutosaveRef = useRef(onAutosave);

  useEffect(() => {
    onAutosaveRef.current = onAutosave;
  }, [onAutosave]);

  useEffect(() => {
    if (
      !enabled ||
      isSaving ||
      saveStatusState === "save-failed" ||
      !draftFingerprint ||
      draftFingerprint === lastSavedFingerprint
    ) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      onAutosaveRef.current?.();
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    debounceMs,
    draftFingerprint,
    enabled,
    isSaving,
    lastSavedFingerprint,
    saveStatusState,
  ]);
}
