import Button from "../../../components/common/Button.jsx";
import Icon from "../../../components/common/Icon.jsx";
import Spinner from "../../../components/common/Spinner.jsx";
import PaperAcademicFields from "./PaperAcademicFields.jsx";
import PaperBasicFields from "./PaperBasicFields.jsx";
import PaperExamSettingsFields from "./PaperExamSettingsFields.jsx";

function QuestionPaperSetupState({ children, indicator, isError = false, title }) {
  return (
    <section
      aria-live="polite"
      className={[
        "question-paper-setup-state",
        isError ? "question-paper-setup-state--error" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      role={isError ? "alert" : "status"}
    >
      {indicator}
      <div>
        <h2>{title}</h2>
        {children}
      </div>
    </section>
  );
}

function QuestionPaperSetupForm({
  assignmentState,
  errors,
  onCancel,
  onClassChange,
  onFieldChange,
  onSubmit,
  subjectOptions,
  values,
}) {
  if (assignmentState.isLoading) {
    return (
      <QuestionPaperSetupState
        indicator={<Spinner label="Loading assigned classes and subjects" />}
        title="Loading assigned classes and subjects..."
      />
    );
  }

  if (assignmentState.error) {
    return (
      <QuestionPaperSetupState
        indicator={<Icon name="alert" size={22} />}
        isError
        title={assignmentState.error}
      />
    );
  }

  if (!assignmentState.hasAssignments) {
    return (
      <QuestionPaperSetupState
        indicator={<Icon name="book" size={22} />}
        title="No classes and subjects are currently assigned to you."
      >
        <p>Contact your School Administrator before creating an exam paper.</p>
      </QuestionPaperSetupState>
    );
  }

  return (
    <form className="question-paper-setup-form" noValidate onSubmit={onSubmit}>
      <PaperBasicFields
        classOptions={assignmentState.classOptions}
        errors={errors}
        onClassChange={onClassChange}
        onFieldChange={onFieldChange}
        subjectOptions={subjectOptions}
        values={values}
      />

      <PaperAcademicFields onFieldChange={onFieldChange} values={values} />

      <PaperExamSettingsFields
        errors={errors}
        onFieldChange={onFieldChange}
        values={values}
      />

      <div className="question-paper-setup-form__actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

export default QuestionPaperSetupForm;
