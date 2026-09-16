import MatchPairList from "./MatchPairList.jsx";

function MatchFollowingEditor({
  editorActions,
  matchFollowing,
  validationErrors = {},
}) {
  return (
    <section
      className="question-type-editor match-following-editor"
      aria-labelledby="match-following-editor-title"
    >
      <div className="question-designer-section-header">
        <h3 id="match-following-editor-title">Match the Following Editor</h3>
        <p>Build the canonical pairs for Column A and Column B.</p>
      </div>

      <MatchPairList
        matchFollowing={matchFollowing}
        onAddPair={editorActions.addMatchFollowingPair}
        onRemovePair={editorActions.removeMatchFollowingPair}
        onTextChange={editorActions.updateMatchFollowingPair}
        validationErrors={validationErrors}
      />
    </section>
  );
}

export default MatchFollowingEditor;
