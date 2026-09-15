import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import AcademicSetupNav from "../../components/academic/AcademicSetupNav.jsx";
import Icon from "../../components/common/Icon.jsx";
import Spinner from "../../components/common/Spinner.jsx";
import PageContainer from "../../components/layout/PageContainer.jsx";
import DashboardHeader from "../../components/school-admin/DashboardHeader.jsx";
import EmptyAssignmentsState from "../../components/teacher-assignments/EmptyAssignmentsState.jsx";
import TeacherAssignmentEditor from "../../components/teacher-assignments/TeacherAssignmentEditor.jsx";
import TeacherSelector from "../../components/teacher-assignments/TeacherSelector.jsx";
import { ACCOUNT_STATUSES } from "../../constants/userStatus.js";
import { useAuth } from "../../hooks/useAuth.js";
import { getClassSubjectMappingId } from "../../services/classSubjectService.js";
import { getTeachersForSchool } from "../../services/teacherService.js";
import {
  getAssignableClassSubjects,
  getTeacherAssignments,
  saveTeacherAssignments,
} from "../../services/teacherAssignmentService.js";

function sortTeachers(firstTeacher, secondTeacher) {
  return (firstTeacher.name || firstTeacher.email || "").localeCompare(
    secondTeacher.name || secondTeacher.email || "",
  );
}

function buildAssignmentGroups(assignablePairs) {
  const groupsByClassId = new Map();

  assignablePairs.forEach((pair) => {
    if (!groupsByClassId.has(pair.classId)) {
      groupsByClassId.set(pair.classId, {
        classRecord: pair.classRecord,
        subjects: [],
      });
    }

    groupsByClassId.get(pair.classId).subjects.push(pair.subject);
  });

  return [...groupsByClassId.values()].map((group) => ({
    ...group,
    subjects: group.subjects.sort((firstSubject, secondSubject) =>
      firstSubject.name.localeCompare(secondSubject.name),
    ),
  }));
}

function buildSelectionsFromAssignments(assignments, assignablePairIds) {
  const selections = {};

  assignments.forEach((assignment) => {
    const pairId = getClassSubjectMappingId(
      assignment.classId,
      assignment.subjectId,
    );

    if (!assignablePairIds.has(pairId)) {
      return;
    }

    selections[assignment.classId] = [
      ...new Set([...(selections[assignment.classId] ?? []), assignment.subjectId]),
    ].sort();
  });

  return selections;
}

function countSelections(selections) {
  return Object.values(selections).reduce(
    (total, subjectIds) => total + subjectIds.length,
    0,
  );
}

function getSelectionPairIds(selections) {
  return new Set(
    Object.entries(selections).flatMap(([classId, subjectIds]) =>
      subjectIds.map((subjectId) => getClassSubjectMappingId(classId, subjectId)),
    ),
  );
}

function countDirtySelections(currentSelections, savedSelections) {
  const currentPairIds = getSelectionPairIds(currentSelections);
  const savedPairIds = getSelectionPairIds(savedSelections);
  let dirtyCount = 0;

  currentPairIds.forEach((pairId) => {
    if (!savedPairIds.has(pairId)) {
      dirtyCount += 1;
    }
  });

  savedPairIds.forEach((pairId) => {
    if (!currentPairIds.has(pairId)) {
      dirtyCount += 1;
    }
  });

  return dirtyCount;
}

function TeacherAssignmentsPage() {
  const { firebaseUser, userProfile } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [assignmentGroups, setAssignmentGroups] = useState([]);
  const [assignablePairIds, setAssignablePairIds] = useState(new Set());
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("");
  const [selectedSubjectIdsByClass, setSelectedSubjectIdsByClass] = useState({});
  const [savedSubjectIdsByClass, setSavedSubjectIdsByClass] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  const schoolId = userProfile?.schoolId ?? "";
  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.uid === selectedTeacherId) ?? null,
    [selectedTeacherId, teachers],
  );
  const selectedCount = useMemo(
    () => countSelections(selectedSubjectIdsByClass),
    [selectedSubjectIdsByClass],
  );
  const dirtyCount = useMemo(
    () =>
      countDirtySelections(selectedSubjectIdsByClass, savedSubjectIdsByClass),
    [savedSubjectIdsByClass, selectedSubjectIdsByClass],
  );

  useEffect(() => {
    let isMounted = true;

    async function loadSetup() {
      if (!schoolId) {
        setPageError("No school is linked to this account.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setPageError("");

      try {
        const [teacherRecords, assignablePairs] = await Promise.all([
          getTeachersForSchool(schoolId),
          getAssignableClassSubjects(schoolId),
        ]);
        const activeTeachers = teacherRecords
          .filter((teacher) => teacher.status === ACCOUNT_STATUSES.ACTIVE)
          .sort(sortTeachers);

        if (!isMounted) {
          return;
        }

        setTeachers(activeTeachers);
        setAssignmentGroups(buildAssignmentGroups(assignablePairs));
        setAssignablePairIds(new Set(assignablePairs.map((pair) => pair.id)));
      } catch (error) {
        console.error("[Teacher assignments] Failed to load setup.", {
          schoolId,
          error,
        });

        if (isMounted) {
          setPageError("Teacher assignment setup could not be loaded.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSetup();

    return () => {
      isMounted = false;
    };
  }, [schoolId]);

  useEffect(() => {
    let isMounted = true;

    async function loadTeacherAssignments() {
      if (!selectedTeacherId) {
        setSelectedSubjectIdsByClass({});
        setSavedSubjectIdsByClass({});
        return;
      }

      setIsLoadingAssignments(true);
      setFeedback({ message: "", type: "" });

      try {
        const assignments = await getTeacherAssignments(schoolId, selectedTeacherId);
        const selections = buildSelectionsFromAssignments(
          assignments,
          assignablePairIds,
        );

        if (isMounted) {
          setSelectedSubjectIdsByClass(selections);
          setSavedSubjectIdsByClass(selections);
        }
      } catch (error) {
        console.error("[Teacher assignments] Failed to load teacher assignments.", {
          schoolId,
          teacherId: selectedTeacherId,
          error,
        });

        if (isMounted) {
          setFeedback({
            message: "Assignments for this teacher could not be loaded.",
            type: "error",
          });
        }
      } finally {
        if (isMounted) {
          setIsLoadingAssignments(false);
        }
      }
    }

    loadTeacherAssignments();

    return () => {
      isMounted = false;
    };
  }, [assignablePairIds, schoolId, selectedTeacherId]);

  const handleTeacherChange = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setFeedback({ message: "", type: "" });
  };

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

  const handleSave = async () => {
    if (!selectedTeacherId || isSaving || isLoadingAssignments) {
      return;
    }

    setIsSaving(true);
    setFeedback({ message: "", type: "" });

    try {
      const assignments = await saveTeacherAssignments(
        schoolId,
        selectedTeacherId,
        selectedSubjectIdsByClass,
        firebaseUser?.uid ?? null,
      );
      const selections = buildSelectionsFromAssignments(assignments, assignablePairIds);

      setSelectedSubjectIdsByClass(selections);
      setSavedSubjectIdsByClass(selections);
      setFeedback({ message: "Teacher assignments saved.", type: "success" });
    } catch (error) {
      console.error("[Teacher assignments] Failed to save assignments.", {
        schoolId,
        teacherId: selectedTeacherId,
        error,
      });
      setFeedback({
        message: error?.message || "Teacher assignments could not be saved.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <section className="schools-state-card" aria-live="polite">
          <Spinner label="Loading teacher assignments" />
          <p>Loading teacher assignments...</p>
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
        description="Assign each teacher to the class and subject combinations they teach."
        schoolName="Academic Setup"
        title="Teacher Assignments"
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

      {teachers.length === 0 && (
        <EmptyAssignmentsState
          action={
            <Link
              className="link-button link-button--primary"
              to="/school-admin/teachers/invite"
            >
              Invite Teacher
            </Link>
          }
          description="Create or activate at least one teacher before assigning classes and subjects."
          title="No active teachers"
        />
      )}

      {teachers.length > 0 && assignmentGroups.length === 0 && (
        <EmptyAssignmentsState
          action={
            <Link
              className="link-button link-button--primary"
              to="/school-admin/class-subjects"
            >
              Map Class Subjects
            </Link>
          }
          description="Create at least one active class-subject mapping before assigning teachers."
          icon="database"
          title="No class-subject mappings"
        />
      )}

      {teachers.length > 0 && assignmentGroups.length > 0 && (
        <>
          <TeacherSelector
            onSearchChange={setTeacherSearchTerm}
            onTeacherChange={handleTeacherChange}
            searchTerm={teacherSearchTerm}
            selectedTeacherId={selectedTeacherId}
            teachers={teachers}
          />

          {selectedTeacher ? (
            <TeacherAssignmentEditor
              assignmentGroups={assignmentGroups}
              dirtyCount={dirtyCount}
              isLoading={isLoadingAssignments}
              isSaving={isSaving}
              onSave={handleSave}
              onToggleSubject={handleToggleSubject}
              selectedCount={selectedCount}
              selectedSubjectIdsByClass={selectedSubjectIdsByClass}
              teacher={selectedTeacher}
            />
          ) : (
            <EmptyAssignmentsState
              description="Select a teacher to load and edit their assignments."
              title="Choose a teacher"
            />
          )}
        </>
      )}
    </PageContainer>
  );
}

export default TeacherAssignmentsPage;
