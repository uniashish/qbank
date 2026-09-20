import { Text, View } from "@react-pdf/renderer";

import { QUESTION_TYPES } from "../../../question-designer/constants/questionTypes.js";

function AnswerText({ children, styles }) {
  return <Text style={styles.answerText}>{children}</Text>;
}

function FillBlanksAnswer({ answer, styles }) {
  if (!answer.blanks.length) {
    return <AnswerText styles={styles}>No blank answers defined.</AnswerText>;
  }

  return (
    <View style={styles.answerList}>
      {answer.blanks.map((blank) => (
        <Text key={blank.id || blank.blankNumber} style={styles.answerListItem}>
          {blank.blankNumber}.{" "}
          {blank.acceptedAnswers.length
            ? blank.acceptedAnswers.join(" / ")
            : "No accepted answer"}
        </Text>
      ))}
    </View>
  );
}

function MatchFollowingAnswer({ answer, styles }) {
  if (!answer.mappings.length) {
    return <AnswerText styles={styles}>No matching pairs defined.</AnswerText>;
  }

  return (
    <View style={styles.answerList}>
      {answer.mappings.map((mapping) => (
        <Text key={mapping.pairId} style={styles.answerListItem}>
          {mapping.leftLabel} - {mapping.rightLabel || "?"}
        </Text>
      ))}
    </View>
  );
}

function MultipleChoiceAnswer({ answer, styles }) {
  const answerLabel = answer.optionLabel
    ? `${answer.optionLabel}${answer.optionText ? `. ${answer.optionText}` : ""}`
    : "No correct option selected";

  return <AnswerText styles={styles}>{answerLabel}</AnswerText>;
}

function RichAnswer({ answer, renderRichBlocks, styles }) {
  if (!answer.hasModelAnswer || answer.modelAnswerBlocks.length === 0) {
    return <AnswerText styles={styles}>No model answer provided.</AnswerText>;
  }

  return (
    <View style={styles.answerRichText}>
      {renderRichBlocks(answer.modelAnswerBlocks, "answer-model")}
    </View>
  );
}

function TrueFalseAnswer({ answer, styles }) {
  return (
    <AnswerText styles={styles}>
      {answer.value || "No correct answer selected"}
    </AnswerText>
  );
}

function UnsupportedAnswer({ answer, styles }) {
  return (
    <AnswerText styles={styles}>
      {answer.message || "Answer key rendering is not available."}
    </AnswerText>
  );
}

function AnswerKeyEntry({ entry, renderRichBlocks, styles }) {
  const shouldAllowWrap =
    Array.isArray(entry.answer.modelAnswerBlocks) &&
    entry.answer.modelAnswerBlocks.length > 3;

  function renderAnswer() {
    switch (entry.answer.kind) {
      case QUESTION_TYPES.FILL_BLANKS:
        return <FillBlanksAnswer answer={entry.answer} styles={styles} />;

      case QUESTION_TYPES.LONG_ANSWER:
      case QUESTION_TYPES.SHORT_ANSWER:
        return (
          <RichAnswer
            answer={entry.answer}
            renderRichBlocks={renderRichBlocks}
            styles={styles}
          />
        );

      case QUESTION_TYPES.MATCH_FOLLOWING:
        return <MatchFollowingAnswer answer={entry.answer} styles={styles} />;

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return <MultipleChoiceAnswer answer={entry.answer} styles={styles} />;

      case QUESTION_TYPES.TRUE_FALSE:
        return <TrueFalseAnswer answer={entry.answer} styles={styles} />;

      default:
        return <UnsupportedAnswer answer={entry.answer} styles={styles} />;
    }
  }

  return (
    <View style={styles.answerQuestion} wrap={!shouldAllowWrap}>
      <Text style={styles.answerQuestionTitle}>
        Question {entry.questionNumber}
      </Text>
      {renderAnswer()}
    </View>
  );
}

function AnswerKeyPdfSection({
  answerKey,
  renderRichBlocks,
  styles,
  title = "ANSWER KEY",
}) {
  const entries = Array.isArray(answerKey?.entries) ? answerKey.entries : [];

  return (
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionSubtitle}>
        {entries.length} question{entries.length === 1 ? "" : "s"}
      </Text>

      {entries.length > 0 ? (
        <View style={styles.answerQuestions}>
          {entries.map((entry) => (
            <AnswerKeyEntry
              entry={entry}
              key={entry.blockId}
              renderRichBlocks={renderRichBlocks}
              styles={styles}
            />
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No questions in this paper.</Text>
      )}
    </View>
  );
}

export default AnswerKeyPdfSection;
