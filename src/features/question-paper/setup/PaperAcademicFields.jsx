import FormField from "../../../components/common/FormField.jsx";

function PaperAcademicFields({ onFieldChange, values }) {
  return (
    <section
      className="question-paper-setup-section"
      aria-labelledby="academic-details-title"
    >
      <div className="question-paper-setup-section__header">
        <h2 id="academic-details-title">Academic Details</h2>
        <p>Add labels that make this paper easier to find later.</p>
      </div>

      <div className="question-paper-setup-grid question-paper-setup-grid--three">
        <FormField htmlFor="question-paper-exam-name" label="Exam Name">
          <input
            className="input"
            id="question-paper-exam-name"
            onChange={(event) => onFieldChange("examName", event.target.value)}
            placeholder="Midterm Exam"
            type="text"
            value={values.examName}
          />
        </FormField>

        <FormField htmlFor="question-paper-term" label="Term">
          <input
            className="input"
            id="question-paper-term"
            onChange={(event) => onFieldChange("term", event.target.value)}
            placeholder="Term 1"
            type="text"
            value={values.term}
          />
        </FormField>

        <FormField htmlFor="question-paper-academic-year" label="Academic Year">
          <input
            className="input"
            id="question-paper-academic-year"
            onChange={(event) =>
              onFieldChange("academicYear", event.target.value)
            }
            placeholder="2026-2027"
            type="text"
            value={values.academicYear}
          />
        </FormField>
      </div>
    </section>
  );
}

export default PaperAcademicFields;
