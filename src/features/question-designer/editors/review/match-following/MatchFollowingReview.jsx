import RichDocumentRenderer from "../../../../../components/rich-editor/RichDocumentRenderer.jsx";
import { getOptionLabel } from "../../../constants/optionLabels.js";
import ReviewEmptyValue from "../../../components/review/ReviewEmptyValue.jsx";
import ReviewSection from "../../../components/review/ReviewSection.jsx";
import { createMatchDisplayModel } from "../../../utils/matchPairHelpers.js";
import { normalizeRichTextContent } from "../../../utils/richTextContent.js";

function MatchFollowingReview({ answerData = {} }) {
  const pairs = Array.isArray(answerData.pairs) ? answerData.pairs : [];
  const displayModel = createMatchDisplayModel(pairs);

  return (
    <ReviewSection
      title="Answer / Matching Pairs"
      titleId="question-review-match-following-title"
    >
      {pairs.length === 0 ? (
        <ReviewEmptyValue>No matching pairs added</ReviewEmptyValue>
      ) : (
        <div className="match-following-review">
          <div className="match-following-review__columns">
            <div className="match-following-review__column">
              <h5>Column A</h5>
              <ol className="match-following-review__list">
                {displayModel.leftPairs.map((pair, index) => (
                  <li className="match-following-review__item" key={pair.id}>
                    <span className="match-following-review__label">
                      {index + 1}.
                    </span>
                    <RichDocumentRenderer
                      ariaLabel={`Column A item ${index + 1} preview`}
                      className="match-following-review__text"
                      content={normalizeRichTextContent(
                        pair.leftContent,
                        pair.left,
                      )}
                    />
                  </li>
                ))}
              </ol>
            </div>

            <div className="match-following-review__column">
              <h5>Column B</h5>
              <ol className="match-following-review__list">
                {displayModel.rightPairs.map((pair, index) => (
                  <li className="match-following-review__item" key={pair.id}>
                    <span className="match-following-review__label">
                      {getOptionLabel(index)}.
                    </span>
                    <RichDocumentRenderer
                      ariaLabel={`Column B item ${getOptionLabel(index)} preview`}
                      className="match-following-review__text"
                      content={normalizeRichTextContent(
                        pair.rightContent,
                        pair.right,
                      )}
                    />
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="match-following-review__matches">
            <h5>Correct Matches</h5>
            <ol className="match-following-review__mapping-list">
              {displayModel.mappings.map((mapping) => (
                <li
                  className="match-following-review__mapping"
                  key={mapping.pairId}
                >
                  <span>{mapping.leftIndex + 1}</span>
                  <span>→</span>
                  <span>{getOptionLabel(mapping.rightIndex)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </ReviewSection>
  );
}

export default MatchFollowingReview;
