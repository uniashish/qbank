import EmptyTeacherAssignments from "./EmptyTeacherAssignments.jsx";
import TeacherClassCard from "./TeacherClassCard.jsx";

function TeacherAssignmentsSummary({ assignmentGroups = [] }) {
  return (
    <section className="teacher-dashboard-card">
      <div className="teacher-dashboard-card__header">
        <div>
          <h2>My Classes & Subjects</h2>
          <p>Only active assignments linked to your account are shown.</p>
        </div>
      </div>

      {assignmentGroups.length > 0 ? (
        <div className="teacher-class-grid">
          {assignmentGroups.map((group) => (
            <TeacherClassCard
              classRecord={group.classRecord}
              key={group.classRecord.id}
              subjects={group.subjects}
            />
          ))}
        </div>
      ) : (
        <EmptyTeacherAssignments />
      )}
    </section>
  );
}

export default TeacherAssignmentsSummary;
