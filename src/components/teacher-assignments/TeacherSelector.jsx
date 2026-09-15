import { useMemo } from "react";

import FormField from "../common/FormField.jsx";

function matchesTeacherSearch(teacher, searchTerm) {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return true;
  }

  return [teacher.name, teacher.email]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(normalizedSearchTerm));
}

function TeacherSelector({
  disabled = false,
  onSearchChange,
  onTeacherChange,
  searchTerm,
  selectedTeacherId,
  teachers,
}) {
  const filteredTeachers = useMemo(
    () => teachers.filter((teacher) => matchesTeacherSearch(teacher, searchTerm)),
    [searchTerm, teachers],
  );

  return (
    <section className="teacher-assignment-panel">
      <div className="teacher-assignment-section-header">
        <div>
          <h2>Select teacher</h2>
          <p>Assignments are scoped to teachers in your school.</p>
        </div>
        <span>{teachers.length}</span>
      </div>

      <div className="teacher-selector-grid">
        <FormField htmlFor="teacher-search" label="Search teachers">
          <input
            className="input"
            disabled={disabled}
            id="teacher-search"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by name or email"
            value={searchTerm}
          />
        </FormField>

        <FormField htmlFor="teacher-select" label="Teacher">
          <select
            className="input teacher-selector-select"
            disabled={disabled || filteredTeachers.length === 0}
            id="teacher-select"
            onChange={(event) => onTeacherChange(event.target.value)}
            value={selectedTeacherId}
          >
            <option value="">Choose a teacher</option>
            {filteredTeachers.map((teacher) => (
              <option key={teacher.uid} value={teacher.uid}>
                {teacher.name || teacher.email} ({teacher.email})
              </option>
            ))}
          </select>
        </FormField>
      </div>

      {teachers.length > 0 && filteredTeachers.length === 0 && (
        <p className="teacher-selector-empty">No teachers match this search.</p>
      )}
    </section>
  );
}

export default TeacherSelector;
