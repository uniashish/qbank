import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AcademicSetupNav from "../../components/academic/AcademicSetupNav.jsx";
import ClassSubjectMapper from "../../components/academic/ClassSubjectMapper.jsx";
import EmptyAcademicState from "../../components/academic/EmptyAcademicState.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import { ACADEMIC_STATUSES } from "../../constants/academicStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import {
  getClassSubjectMappingsForSchool,
  saveSubjectMappingsForClass,
} from "../../services/classSubjectService.js";
import { getClassesForSchool } from "../../services/classService.js";
import { getSubjectsForSchool } from "../../services/subjectService.js";

function buildSelectedSubjectIdsByClass(classes, subjects, mappings) {
  const activeClassIds = new Set(classes.map((classRecord) => classRecord.id));
  const activeSubjectIds = new Set(subjects.map((subject) => subject.id));
  const selectedByClass = Object.fromEntries(
    classes.map((classRecord) => [classRecord.id, []]),
  );

  mappings.forEach((mapping) => {
    if (
      !activeClassIds.has(mapping.classId) ||
      !activeSubjectIds.has(mapping.subjectId)
    ) {
      return;
    }

    selectedByClass[mapping.classId].push(mapping.subjectId);
  });

  Object.keys(selectedByClass).forEach((classId) => {
    selectedByClass[classId] = [...new Set(selectedByClass[classId])].sort();
  });

  return selectedByClass;
}

function areIdListsEqual(firstList = [], secondList = []) {
  if (firstList.length !== secondList.length) {
    return false;
  }

  const sortedFirstList = [...firstList].sort();
  const sortedSecondList = [...secondList].sort();

  return sortedFirstList.every(
    (item, index) => item === sortedSecondList[index],
  );
}

function getDirtyClassIds(classes, selectedByClass, savedByClass) {
  const dirtyClassIds = new Set();

  classes.forEach((classRecord) => {
    if (
      !areIdListsEqual(
        selectedByClass[classRecord.id] ?? [],
        savedByClass[classRecord.id] ?? [],
      )
    ) {
      dirtyClassIds.add(classRecord.id);
    }
  });

  return dirtyClassIds;
}

function ClassSubjectMappingPage() {
  const { firebaseUser, userProfile } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectIdsByClass, setSelectedSubjectIdsByClass] = useState({});
  const [savedSubjectIdsByClass, setSavedSubjectIdsByClass] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  const [savingClassId, setSavingClassId] = useState("");

  const schoolId = userProfile?.schoolId ?? "";
  const activeClasses = useMemo(
    () =>
      classes.filter((classRecord) => classRecord.status === ACADEMIC_STATUSES.ACTIVE),
    [classes],
  );
  const activeSubjects = useMemo(
    () => subjects.filter((subject) => subject.status === ACADEMIC_STATUSES.ACTIVE),
    [subjects],
  );
  const dirtyClassIds = useMemo(
    () =>
      getDirtyClassIds(
        activeClasses,
        selectedSubjectIdsByClass,
        savedSubjectIdsByClass,
      ),
    [activeClasses, savedSubjectIdsByClass, selectedSubjectIdsByClass],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadAcademicSetup() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const [classRecords, subjectRecords, mappingRecords] = await Promise.all([
          getClassesForSchool(schoolId),
          getSubjectsForSchool(schoolId),
          getClassSubjectMappingsForSchool(schoolId),
        ]);

        if (!isMounted) {
          return;
        }

        const activeClassRecords = classRecords.filter(
          (classRecord) => classRecord.status === ACADEMIC_STATUSES.ACTIVE,
        );
        const activeSubjectRecords = subjectRecords.filter(
          (subject) => subject.status === ACADEMIC_STATUSES.ACTIVE,
        );
        const selectedByClass = buildSelectedSubjectIdsByClass(
          activeClassRecords,
          activeSubjectRecords,
          mappingRecords,
        );

        setClasses(classRecords);
        setSubjects(subjectRecords);
        setSelectedSubjectIdsByClass(selectedByClass);
        setSavedSubjectIdsByClass(selectedByClass);
      } catch (error) {
        console.error("[Academic setup] Failed to load class-subject mappings.", {
          schoolId,
          error,
        });

        if (isMounted) {
          setPageError("Class-subject mappings could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadAcademicSetup();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  const handleToggleSubject = (classId, subjectId, isSelected) => {
    setFeedback({ message: "", type: "" });
    setSelectedSubjectIdsByClass((currentSelections) => {
      const currentSubjectIds = currentSelections[classId] ?? [];
      const nextSubjectIds = isSelected
        ? [...new Set([...currentSubjectIds, subjectId])]
        : currentSubjectIds.filter((currentSubjectId) => currentSubjectId !== subjectId);

      return {
        ...currentSelections,
        [classId]: nextSubjectIds.sort(),
      };
    });
  };

  const handleSaveClass = async (classId) => {
    if (savingClassId) {
      return;
    }

    setSavingClassId(classId);
    setFeedback({ message: "", type: "" });

    try {
      const savedMappings = await saveSubjectMappingsForClass({
        classId,
        createdByUid: firebaseUser?.uid ?? null,
        schoolId,
        subjectIds: selectedSubjectIdsByClass[classId] ?? [],
      });
      const savedSubjectIds = savedMappings
        .map((mapping) => mapping.subjectId)
        .filter(Boolean)
        .sort();

      setSavedSubjectIdsByClass((currentSelections) => ({
        ...currentSelections,
        [classId]: savedSubjectIds,
      }));
      setSelectedSubjectIdsByClass((currentSelections) => ({
        ...currentSelections,
        [classId]: savedSubjectIds,
      }));
      setFeedback({ message: "Class-subject mappings saved.", type: "success" });
    } catch (error) {
      console.error("[Academic setup] Failed to save class-subject mappings.", {
        classId,
        schoolId,
        error,
      });
      setFeedback({
        message: error?.message || "Class-subject mappings could not be saved.",
        type: "error",
      });
    } finally {
      setSavingClassId("");
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading class-subject mappings" />
          <p>Loading class-subject mappings...</p>
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
        description="Choose which active subjects are taught in each active class."
        schoolName="Academic Setup"
        title="Class-Subject Mapping"
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

      {activeClasses.length === 0 && (
        <EmptyAcademicState
          action={
            <Link
              className="link-button link-button--primary"
              to="/school-admin/classes"
            >
              Create Class
            </Link>
          }
          description="Create at least one class before mapping subjects."
          icon="schools"
          title="No active classes"
        />
      )}

      {activeClasses.length > 0 && activeSubjects.length === 0 && (
        <EmptyAcademicState
          action={
            <Link
              className="link-button link-button--primary"
              to="/school-admin/subjects"
            >
              Create Subject
            </Link>
          }
          description="Create at least one subject before mapping subjects."
          icon="book"
          title="No active subjects"
        />
      )}

      {activeClasses.length > 0 && activeSubjects.length > 0 && (
        <ClassSubjectMapper
          classes={activeClasses}
          dirtyClassIds={dirtyClassIds}
          onSaveClass={handleSaveClass}
          onToggleSubject={handleToggleSubject}
          savingClassId={savingClassId}
          selectedSubjectIdsByClass={selectedSubjectIdsByClass}
          subjects={activeSubjects}
        />
      )}
    </PageContainer>
  );
}

export default ClassSubjectMappingPage;
