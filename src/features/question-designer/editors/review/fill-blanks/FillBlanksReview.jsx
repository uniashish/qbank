import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";

function FillBlanksReview({ answerData = {} }) {
  const blanks = Array.isArray(answerData.blanks) ? answerData.blanks : [];

  return (
    <ReviewSection
      title="Accepted Answers"
      titleId="question-review-fill-blanks-title"
    >
      {blanks.length === 0 ? (
        <ReviewEmptyValue>No accepted answers defined</ReviewEmptyValue>
      ) : (
        <div className="fill-blanks-review">
          {blanks.map((blank, index) => (
            <section
              aria-labelledby={`fill-blanks-review-${index + 1}`}
              className="fill-blanks-review__blank"
              key={blank.id || `blank-${index + 1}`}
            >
              <h5 id={`fill-blanks-review-${index + 1}`}>Blank {index + 1}</h5>
              <ul className="fill-blanks-review__answers">
                {(blank.acceptedAnswers ?? []).map((answer, answerIndex) => (
                  <li key={`${blank.id || index}-${answerIndex}`}>{answer}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </ReviewSection>
  );
}

export default FillBlanksReview;
