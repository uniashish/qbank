const DESIGNER_STEPS = [
  { id: 1, label: "Type" },
  { id: 2, label: "Details" },
  { id: 3, label: "Answer" },
  { id: 4, label: "Review" },
];

function QuestionDesignerStepper({ currentStep = 1 }) {
  return (
    <nav className="question-designer-stepper" aria-label="Question designer steps">
      {DESIGNER_STEPS.map((step) => {
        const isCurrent = currentStep === step.id;
        const isComplete = currentStep > step.id;

        return (
          <span
            aria-current={isCurrent ? "step" : undefined}
            className={[
              "question-designer-step",
              isCurrent ? "question-designer-step--current" : "",
              isComplete ? "question-designer-step--complete" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={step.id}
          >
            <span className="question-designer-step__number">{step.id}</span>
            <span>{step.label}</span>
          </span>
        );
      })}
    </nav>
  );
}

export default QuestionDesignerStepper;
