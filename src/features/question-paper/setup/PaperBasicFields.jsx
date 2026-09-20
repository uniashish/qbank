import FormField from "../../../components/common/FormField.jsx";

function PaperBasicFields({
  classOptions,
  errors,
  onClassChange,
  onFieldChange,
  subjectOptions,
  values,
}) {
  const titleFieldId = "question-paper-title";
  const classFieldId = "question-paper-class";
  const subjectFieldId = "question-paper-subject";
  const subjectHelperText = !values.classId
    ? "Choose a class first."
    : subjectOptions.length === 0
      ? "No subjects are assigned to this class."
      : undefined;
  const subjectDescribedByIds = [
    subjectHelperText ? `${subjectFieldId}-helper` : "",
    errors.subjectId ? `${subjectFieldId}-error` : "",
  ].filter(Boolean);

  return (
    <section
      className="question-paper-setup-section"
      aria-labelledby="paper-details-title"
    >
      <div className="question-paper-setup-section__header">
        <h2 id="paper-details-title">Paper Details</h2>
        <p>Name the paper and choose from your assigned class-subject pairs.</p>
      </div>

      <div className="question-paper-setup-grid">
        <FormField
          error={errors.title}
          htmlFor={titleFieldId}
          label="Paper Title"
          required
        >
          <input
            aria-describedby={
              errors.title ? `${titleFieldId}-error` : undefined
            }
            aria-invalid={Boolean(errors.title)}
            className="input"
            id={titleFieldId}
            onChange={(event) => onFieldChange("title", event.target.value)}
            placeholder="Midterm Mathematics Paper"
            type="text"
            value={values.title}
          />
        </FormField>

        <div className="question-paper-setup-grid question-paper-setup-grid--two">
          <FormField
            error={errors.classId}
            htmlFor={classFieldId}
            label="Class"
            required
          >
            <select
              aria-describedby={
                errors.classId ? `${classFieldId}-error` : undefined
              }
              aria-invalid={Boolean(errors.classId)}
              className="input question-paper-setup-select"
              id={classFieldId}
              onChange={(event) => onClassChange(event.target.value)}
              value={values.classId}
            >
              <option value="">Select class</option>
              {classOptions.map((classOption) => (
                <option key={classOption.id} value={classOption.id}>
                  {classOption.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            error={errors.subjectId}
            helperText={subjectHelperText}
            htmlFor={subjectFieldId}
            label="Subject"
            required
          >
            <select
              aria-describedby={
                subjectDescribedByIds.length > 0
                  ? subjectDescribedByIds.join(" ")
                  : undefined
              }
              aria-invalid={Boolean(errors.subjectId)}
              className="input question-paper-setup-select"
              disabled={!values.classId || subjectOptions.length === 0}
              id={subjectFieldId}
              onChange={(event) =>
                onFieldChange("subjectId", event.target.value)
              }
              value={values.subjectId}
            >
              <option value="">Select subject</option>
              {subjectOptions.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </div>
    </section>
  );
}

export default PaperBasicFields;
