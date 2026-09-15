import { useEffect, useState } from "react";

import AcademicSetupNav from "../../components/academic/AcademicSetupNav.jsx";
import EmptyAcademicState from "../../components/academic/EmptyAcademicState.jsx";
import SubjectForm from "../../components/academic/SubjectForm.jsx";
import SubjectsList from "../../components/academic/SubjectsList.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { ACADEMIC_STATUSES } from "../../constants/academicStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  createSubject,
  getSubjectsForSchool,
  normalizeSubjectCode,
  updateSubject,
  updateSubjectStatus,
} from "../../services/subjectService.js";

const initialValues = {
  code: "",
  name: "",
  status: ACADEMIC_STATUSES.ACTIVE,
};

const initialErrors = {
  code: "",
  name: "",
};

function sortAcademicRecords(firstItem, secondItem) {
  return (
    firstItem.name.localeCompare(secondItem.name) ||
    firstItem.code.localeCompare(secondItem.code)
  );
}

function validateSubjectForm(values) {
  const errors = { ...initialErrors };
  const normalizedCode = normalizeSubjectCode(values.code ?? "");
  const normalizedName = values.name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    errors.name = "Enter the subject name.";
  }

  if (!normalizedCode) {
    errors.code = "Enter the subject code.";
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
  };
}

function getActionErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function SubjectsPage() {
  const { firebaseUser, userProfile } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [editingSubject, setEditingSubject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const schoolId = userProfile?.schoolId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadSubjects() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const subjectRecords = await getSubjectsForSchool(schoolId);

        if (isMounted) {
          setSubjects(subjectRecords);
        }
      } catch (error) {
        console.error("[Academic setup] Failed to load subjects.", {
          schoolId,
          error,
        });

        if (isMounted) {
          setPageError("Subjects could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSubjects();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const resetForm = () => {
    setValues(initialValues);
    setErrors(initialErrors);
    setEditingSubject(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setValues({
      code: subject.code,
      name: subject.name,
      status: subject.status,
    });
    setErrors(initialErrors);
    setFeedback({ message: "", type: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation = validateSubjectForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before saving the subject.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      if (editingSubject) {
        const updatedSubject = await updateSubject({
          ...values,
          schoolId,
          subjectId: editingSubject.id,
        });

        setSubjects((currentSubjects) =>
          currentSubjects
            .map((subject) =>
              subject.id === editingSubject.id
                ? { ...subject, ...updatedSubject }
                : subject,
            )
            .sort(sortAcademicRecords),
        );
        setFeedback({ message: "Subject updated.", type: "success" });
      } else {
        const newSubject = await createSubject({
          ...values,
          createdByUid: firebaseUser?.uid ?? null,
          schoolId,
        });

        setSubjects((currentSubjects) =>
          [...currentSubjects, newSubject].sort(sortAcademicRecords),
        );
        setFeedback({ message: "Subject created.", type: "success" });
      }

      resetForm();
    } catch (error) {
      console.error("[Academic setup] Failed to save subject.", {
        code: values.code,
        schoolId,
        error,
      });
      setFeedback({
        message: getActionErrorMessage(error, "Subject could not be saved."),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyStatusChange = async (subject, nextStatus) => {
    setIsUpdatingStatus(true);
    setFeedback({ message: "", type: "" });

    try {
      await updateSubjectStatus(schoolId, subject.id, nextStatus);
      setSubjects((currentSubjects) =>
        currentSubjects.map((currentSubject) =>
          currentSubject.id === subject.id
            ? { ...currentSubject, status: nextStatus, updatedAt: new Date() }
            : currentSubject,
        ),
      );
      setPendingStatusChange(null);
      setFeedback({ message: "Subject status updated.", type: "success" });
    } catch (error) {
      console.error("[Academic setup] Failed to update subject status.", {
        schoolId,
        status: nextStatus,
        subjectId: subject.id,
        error,
      });
      setFeedback({
        message: "Subject status could not be updated.",
        type: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestStatusChange = (subject, nextStatus) => {
    if (nextStatus === ACADEMIC_STATUSES.INACTIVE) {
      setPendingStatusChange({
        id: subject.id,
        nextStatus,
      });
      return;
    }

    applyStatusChange(subject, nextStatus);
  };

  const handleConfirmStatusChange = () => {
    const subject = subjects.find(
      (currentSubject) => currentSubject.id === pendingStatusChange?.id,
    );

    if (!subject || !pendingStatusChange) {
      return;
    }

    applyStatusChange(subject, pendingStatusChange.nextStatus);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading subjects" />
          <p>Loading subjects...</p>
        </section>
      </PageContainer>
    );
  }

  if (pageError) {
    return (
      <PageContainer size="narrow">
        <section className="schools-state-card schools-state-card--error" role="alert">
          <Icon name="alert" size={22} />
          <p>{pageError}</p>
        </section>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <DashboardHeader
        description="Create reusable subjects once, then map them to the classes that teach them."
        schoolName="Academic Setup"
        title="Subjects"
      />

      <AcademicSetupNav />

      {feedback.message && (
        <div
          className={`school-feedback school-feedback--${feedback.type}`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.message}
        </div>
      )}

      <section className="academic-form-card">
        <div className="academic-section-header">
          <div>
            <h2>{editingSubject ? "Edit subject" : "Create subject"}</h2>
            <p>Subjects are shared across class mappings in your school.</p>
          </div>
          <Icon name="book" size={22} />
        </div>
        <SubjectForm
          disabled={!schoolId}
          errors={errors}
          isEditing={Boolean(editingSubject)}
          isSubmitting={isSubmitting}
          onCancel={resetForm}
          onChange={handleChange}
          onSubmit={handleSubmit}
          values={values}
        />
      </section>

      {subjects.length > 0 ? (
        <SubjectsList
          isUpdatingStatus={isUpdatingStatus}
          onCancelStatusChange={() => setPendingStatusChange(null)}
          onConfirmStatusChange={handleConfirmStatusChange}
          onEdit={handleEdit}
          onRequestStatusChange={handleRequestStatusChange}
          pendingStatusChange={pendingStatusChange}
          subjects={subjects}
        />
      ) : (
        <EmptyAcademicState
          description="Create subjects once, then attach them to the classes that need them."
          icon="book"
          title="No subjects created yet"
        />
      )}
    </PageContainer>
  );
}

export default SubjectsPage;
