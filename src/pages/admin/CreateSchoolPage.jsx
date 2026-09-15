import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import DashboardHeader from "../../components/admin/dashboard/DashboardHeader.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import SchoolForm from "../../components/schools/SchoolForm.jsx";
import { SCHOOL_STATUSES } from "../../constants/schoolStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import { createSchool } from "../../services/schoolService.js";
import { validateSchoolForm } from "../../utils/schoolValidation.js";

const initialValues = {
  address: "",
  city: "",
  code: "",
  country: "",
  email: "",
  name: "",
  phone: "",
  status: SCHOOL_STATUSES.ACTIVE,
};

const initialErrors = {
  address: "",
  city: "",
  code: "",
  country: "",
  email: "",
  name: "",
  phone: "",
  status: "",
};

function CreateSchoolPage() {
  const navigate = useNavigate();
  const { firebaseUser } = useAuth();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation = validateSchoolForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before creating the school.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      const schoolId = await createSchool(
        validation.values,
        firebaseUser?.uid ?? null,
      );

      setFeedback({ message: "School created.", type: "success" });
      navigate(`/admin/schools/${schoolId}`, { replace: true });
    } catch {
      setFeedback({
        message: "The school could not be created. Try again in a moment.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer size="narrow">
      <DashboardHeader
        actions={
          <Link className="link-button link-button--secondary" to="/admin/schools">
            Back to schools
          </Link>
        }
        description="Create a school record now. Administrator invitation will be added in a later phase."
        title="Add School"
      />
      <section className="school-form-card">
        <SchoolForm
          errors={errors}
          feedback={feedback}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
          values={values}
        />
      </section>
    </PageContainer>
  );
}

export default CreateSchoolPage;
