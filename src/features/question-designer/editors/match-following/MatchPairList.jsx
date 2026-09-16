import AddMatchPairButton from "./AddMatchPairButton.jsx";
import MatchPairRow from "./MatchPairRow.jsx";
import {
  MAX_MATCH_FOLLOWING_PAIRS,
  MIN_MATCH_FOLLOWING_PAIRS,
} from "./matchFollowingValidation.js";

function MatchPairList({
  matchFollowing,
  onAddPair,
  onRemovePair,
  onTextChange,
  validationErrors = {},
}) {
  const pairs = matchFollowing.pairs;
  const canAddPair = pairs.length < MAX_MATCH_FOLLOWING_PAIRS;
  const canRemovePair = pairs.length > MIN_MATCH_FOLLOWING_PAIRS;

  return (
    <section
      className="match-following-pairs"
      aria-labelledby="match-following-pairs-title"
    >
      <div className="match-following-pairs__header">
        <h4 id="match-following-pairs-title">Matching Pairs</h4>
        <span>
          {pairs.length}/{MAX_MATCH_FOLLOWING_PAIRS}
        </span>
      </div>

      {validationErrors.pairs && (
        <p className="form-field__error" role="alert">
          {validationErrors.pairs}
        </p>
      )}

      <div className="match-following-pairs__labels" aria-hidden="true">
        <span />
        <span>Column A</span>
        <span />
        <span>Column B</span>
        <span />
      </div>

      <fieldset className="match-following-pairs__fieldset">
        <legend className="sr-only">Match the following pairs</legend>
        {pairs.map((pair, index) => (
          <MatchPairRow
            canRemove={canRemovePair}
            errors={validationErrors.pairTexts?.[pair.id]}
            index={index}
            key={pair.id}
            onRemove={onRemovePair}
            onTextChange={onTextChange}
            pair={pair}
          />
        ))}
      </fieldset>

      <AddMatchPairButton disabled={!canAddPair} onClick={onAddPair} />
    </section>
  );
}

export default MatchPairList;
