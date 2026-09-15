function TeacherClassCard({ classRecord, subjects = [] }) {
  return (
    <article className="teacher-class-card">
      <div className="teacher-class-card__header">
        <div>
          <h3>{classRecord?.name || "Class"}</h3>
          {classRecord?.code && <p>{classRecord.code}</p>}
        </div>
        <span>
          {subjects.length} {subjects.length === 1 ? "subject" : "subjects"}
        </span>
      </div>

      <ul className="teacher-class-card__subjects">
        {subjects.map((subject) => (
          <li key={subject.id}>
            <span>{subject.name}</span>
            {subject.code && <small>{subject.code}</small>}
          </li>
        ))}
      </ul>
    </article>
  );
}

export default TeacherClassCard;
