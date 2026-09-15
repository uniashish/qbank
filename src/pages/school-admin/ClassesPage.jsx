import { useEffect, useState } from "react";

import AcademicSetupNav from "../../components/academic/AcademicSetupNav.jsx";
import ClassForm from "../../components/academic/ClassForm.jsx";
import ClassesList from "../../components/academic/ClassesList.jsx";
import EmptyAcademicState from "../../components/academic/EmptyAcademicState.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { ACADEMIC_STATUSES } from "../../constants/academicStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  createClass,
  getClassesForSchool,
  normalizeClassCode,
  updateClass,
  updateClassStatus,
} from "../../services/classService.js";

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

function validateClassForm(values) {
  const errors = { ...initialErrors };
  const normalizedCode = normalizeClassCode(values.code ?? "");
  const normalizedName = values.name.trim().replace(/\s+/g, " ");

  if (!normalizedName) {
    errors.name = "Enter the class name.";
  }

  if (!normalizedCode) {
    errors.code = "Enter the class code.";
  }

  return {
    errors,
    isValid: !Object.values(errors).some(Boolean),
  };
}

function getActionErrorMessage(error, fallback) {
  return error?.message || fallback;
}

function ClassesPage() {
  const { firebaseUser, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState(initialErrors);
  const [editingClass, setEditingClass] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const schoolId = userProfile?.schoolId ?? "";

  useEffect(() => {
    let isMounted = true;

    async function loadClasses() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const classRecords = await getClassesForSchool(schoolId);

        if (isMounted) {
          setClasses(classRecords);
        }
      } catch (error) {
        console.error("[Academic setup] Failed to load classes.", {
          schoolId,
          error,
        });

        if (isMounted) {
          setPageError("Classes could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadClasses();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const resetForm = () => {
    setValues(initialValues);
    setErrors(initialErrors);
    setEditingClass(null);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((currentValues) => ({ ...currentValues, [name]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [name]: "" }));
  };

  const handleEdit = (classRecord) => {
    setEditingClass(classRecord);
    setValues({
      code: classRecord.code,
      name: classRecord.name,
      status: classRecord.status,
    });
    setErrors(initialErrors);
    setFeedback({ message: "", type: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validation = validateClassForm(values);
    setErrors(validation.errors);

    if (!validation.isValid) {
      setFeedback({
        message: "Review the highlighted fields before saving the class.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ message: "", type: "" });

    try {
      if (editingClass) {
        const updatedClass = await updateClass({
          ...values,
          classId: editingClass.id,
          schoolId,
        });

        setClasses((currentClasses) =>
          currentClasses
            .map((classRecord) =>
              classRecord.id === editingClass.id
                ? { ...classRecord, ...updatedClass }
                : classRecord,
            )
            .sort(sortAcademicRecords),
        );
        setFeedback({ message: "Class updated.", type: "success" });
      } else {
        const newClass = await createClass({
          ...values,
          createdByUid: firebaseUser?.uid ?? null,
          schoolId,
        });

        setClasses((currentClasses) =>
          [...currentClasses, newClass].sort(sortAcademicRecords),
        );
        setFeedback({ message: "Class created.", type: "success" });
      }

      resetForm();
    } catch (error) {
      console.error("[Academic setup] Failed to save class.", {
        code: values.code,
        schoolId,
        error,
      });
      setFeedback({
        message: getActionErrorMessage(error, "Class could not be saved."),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyStatusChange = async (classRecord, nextStatus) => {
    setIsUpdatingStatus(true);
    setFeedback({ message: "", type: "" });

    try {
      await updateClassStatus(schoolId, classRecord.id, nextStatus);
      setClasses((currentClasses) =>
        currentClasses.map((currentClass) =>
          currentClass.id === classRecord.id
            ? { ...currentClass, status: nextStatus, updatedAt: new Date() }
            : currentClass,
        ),
      );
      setPendingStatusChange(null);
      setFeedback({ message: "Class status updated.", type: "success" });
    } catch (error) {
      console.error("[Academic setup] Failed to update class status.", {
        classId: classRecord.id,
        schoolId,
        status: nextStatus,
        error,
      });
      setFeedback({
        message: "Class status could not be updated.",
        type: "error",
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleRequestStatusChange = (classRecord, nextStatus) => {
    if (nextStatus === ACADEMIC_STATUSES.INACTIVE) {
      setPendingStatusChange({
        id: classRecord.id,
        nextStatus,
      });
      return;
    }

    applyStatusChange(classRecord, nextStatus);
  };

  const handleConfirmStatusChange = () => {
    const classRecord = classes.find(
      (currentClass) => currentClass.id === pendingStatusChange?.id,
    );

    if (!classRecord || !pendingStatusChange) {
      return;
    }

    applyStatusChange(classRecord, pendingStatusChange.nextStatus);
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading classes" />
          <p>Loading classes...</p>
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
        description="Create classes first, then add subjects and map them together."
        schoolName="Academic Setup"
        title="Classes"
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
            <h2>{editingClass ? "Edit class" : "Create class"}</h2>
            <p>Class records are scoped to your school automatically.</p>
          </div>
          <Icon name="schools" size={22} />
        </div>
        <ClassForm
          disabled={!schoolId}
          errors={errors}
          isEditing={Boolean(editingClass)}
          isSubmitting={isSubmitting}
          onCancel={resetForm}
          onChange={handleChange}
          onSubmit={handleSubmit}
          values={values}
        />
      </section>

      {classes.length > 0 ? (
        <ClassesList
          classes={classes}
          isUpdatingStatus={isUpdatingStatus}
          onCancelStatusChange={() => setPendingStatusChange(null)}
          onConfirmStatusChange={handleConfirmStatusChange}
          onEdit={handleEdit}
          onRequestStatusChange={handleRequestStatusChange}
          pendingStatusChange={pendingStatusChange}
        />
      ) : (
        <EmptyAcademicState
          description="Create classes before adding class-subject mappings."
          icon="schools"
          title="No classes created yet"
        />
      )}
    </PageContainer>
  );
}

export default ClassesPage;
