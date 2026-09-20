import { useMemo, useState } from "react";

import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import FinalizePaperDialog from "./FinalizePaperDialog.jsx";
import { validatePaperFinalization } from "./paperFinalizationValidation.js";

function FinalizePaperButton({
  designerState,
  isFinalizing = false,
  onFinalize,
  paperId,
  summary,
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [finalizationError, setFinalizationError] = useState("");
  const validation = useMemo(
    () =>
      validatePaperFinalization({
        designerState,
        paperId,
        summary,
      }),
    [designerState, paperId, summary],
  );
  const dialogValidation = useMemo(
    () => ({
      ...validation,
      errors: finalizationError
        ? [...validation.errors, finalizationError]
        : validation.errors,
      canFinalize: validation.canFinalize,
    }),
    [finalizationError, validation],
  );

  async function handleConfirm() {
    if (!validation.canFinalize || isFinalizing) {
      return;
    }

    setFinalizationError("");

    try {
      await onFinalize();
      setIsDialogOpen(false);
    } catch (error) {
      setFinalizationError(
        error?.message ?? "Paper could not be finalized. Try again.",
      );
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setFinalizationError("");
          setIsDialogOpen(true);
        }}
        type="button"
        variant="secondary"
      >
        <Icon name="shield" size={18} />
        <span>Finalize Paper</span>
      </Button>

      <FinalizePaperDialog
        isFinalizing={isFinalizing}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirm}
        summary={summary}
        validation={dialogValidation}
      />
    </>
  );
}

export default FinalizePaperButton;
