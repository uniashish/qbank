import { useEffect, useRef, useState } from "react";

function EquationEditorField({
  ariaDescribedBy,
  autoFocus = false,
  id,
  onChange,
  value,
}) {
  const fieldRef = useRef(null);
  const [isMathLiveReady, setIsMathLiveReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    import("mathlive")
      .then(() => {
        if (isMounted) {
          setIsMathLiveReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsMathLiveReady(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const field = fieldRef.current;

    if (!field || !isMathLiveReady) {
      return;
    }

    if (field.value !== value) {
      field.value = value;
    }
  }, [isMathLiveReady, value]);

  useEffect(() => {
    const field = fieldRef.current;

    if (!field || !isMathLiveReady) {
      return undefined;
    }

    function handleValueChange(event) {
      onChange?.(event.target?.value ?? "");
    }

    field.addEventListener("input", handleValueChange);
    field.addEventListener("change", handleValueChange);

    return () => {
      field.removeEventListener("input", handleValueChange);
      field.removeEventListener("change", handleValueChange);
    };
  }, [isMathLiveReady, onChange]);

  useEffect(() => {
    if (!autoFocus || !isMathLiveReady || typeof window === "undefined") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const field = fieldRef.current;

      field?.focus?.();
      field?.executeCommand?.("moveToMathfieldEnd");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [autoFocus, isMathLiveReady]);

  if (!isMathLiveReady) {
    return (
      <div
        aria-describedby={ariaDescribedBy}
        className="rich-text-editor-equation-field rich-text-editor-equation-field--loading"
        role="status"
      >
        Loading equation editor...
      </div>
    );
  }

  return (
    <math-field
      aria-describedby={ariaDescribedBy}
      aria-label="Equation"
      className="rich-text-editor-equation-field"
      id={id}
      ref={fieldRef}
      smart-fence=""
      virtual-keyboard-mode="auto"
    />
  );
}

export default EquationEditorField;
