import Button from "../../../components/common/Button.jsx";
import TemplateExamDefaults from "./TemplateExamDefaults.jsx";
import TemplateIdentityFields from "./TemplateIdentityFields.jsx";

function TemplateSetupForm({
  errors,
  onCancel,
  onDefaultSetupChange,
  onFieldChange,
  onSubmit,
  values,
}) {
  return (
    <form
      className="question-paper-template-setup-form"
      noValidate
      onSubmit={onSubmit}
    >
      <TemplateIdentityFields
        errors={errors}
        onFieldChange={onFieldChange}
        values={values}
      />

      <TemplateExamDefaults
        errors={errors}
        onDefaultSetupChange={onDefaultSetupChange}
        values={values}
      />

      <div className="question-paper-template-setup-form__actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

export default TemplateSetupForm;
