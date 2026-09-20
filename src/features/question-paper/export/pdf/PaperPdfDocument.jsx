import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { QUESTION_TYPES } from "../../../question-designer/constants/questionTypes.js";
import AnswerKeyPdfSection from "./AnswerKeyPdfSection.jsx";
import ImagePdfRenderer from "./rich-content/ImagePdfRenderer.jsx";
import RichTextPdfRenderer from "./rich-content/RichTextPdfRenderer.jsx";

const styles = StyleSheet.create({
  answerList: {
    gap: 3,
  },
  answerListItem: {
    color: "#1f2937",
    fontSize: 10,
    lineHeight: 1.45,
  },
  answerQuestion: {
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  answerQuestionTitle: {
    color: "#111827",
    fontSize: 10.5,
    fontWeight: 700,
    marginBottom: 4,
  },
  answerQuestions: {
    gap: 9,
    marginTop: 14,
  },
  answerRichText: {
    borderLeftColor: "#d1d5db",
    borderLeftWidth: 2,
    paddingLeft: 8,
  },
  answerText: {
    color: "#1f2937",
    fontSize: 10,
    lineHeight: 1.45,
  },
  bullet: {
    color: "#111827",
    fontSize: 9.5,
    lineHeight: 1.35,
    marginRight: 5,
    width: 14,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 10,
    lineHeight: 1.4,
    marginTop: 10,
  },
  footer: {
    bottom: 22,
    color: "#6b7280",
    fontSize: 8,
    left: 42,
    position: "absolute",
    right: 42,
    textAlign: "center",
  },
  headingBlock: {
    color: "#111827",
    fontSize: 12,
    fontWeight: 700,
    lineHeight: 1.35,
    marginBottom: 5,
  },
  headingBlockCompact: {
    marginBottom: 2,
  },
  headingBlockLevelOne: {
    fontSize: 14,
  },
  headingBlockLevelThree: {
    fontSize: 11,
  },
  headingBlockLevelTwo: {
    fontSize: 12,
  },
  imagePlaceholder: {
    borderColor: "#d1d5db",
    borderRadius: 3,
    borderStyle: "dashed",
    borderWidth: 1,
    color: "#6b7280",
    fontSize: 9,
    lineHeight: 1.3,
    marginBottom: 6,
    marginTop: 7,
    padding: 7,
  },
  inlineBold: {
    fontWeight: 700,
  },
  inlineItalic: {
    fontStyle: "italic",
  },
  inlineSubscript: {
    fontSize: 7,
  },
  inlineSuperscript: {
    fontSize: 7,
  },
  instructions: {
    backgroundColor: "#f9fafb",
    borderColor: "#d1d5db",
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 14,
    padding: 10,
  },
  instructionsTitle: {
    color: "#111827",
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 5,
  },
  list: {
    gap: 3,
    marginBottom: 6,
  },
  listCompact: {
    gap: 1,
    marginBottom: 2,
  },
  listItem: {
    display: "flex",
    flexDirection: "row",
  },
  listItemBody: {
    flex: 1,
  },
  marks: {
    color: "#111827",
    fontSize: 9.5,
    fontWeight: 700,
    minWidth: 58,
    textAlign: "right",
  },
  matchGrid: {
    borderColor: "#d1d5db",
    borderRadius: 4,
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
    marginTop: 8,
    overflow: "hidden",
  },
  matchColumn: {
    flex: 1,
  },
  matchColumnDivider: {
    borderLeftColor: "#d1d5db",
    borderLeftWidth: 1,
  },
  matchHeader: {
    backgroundColor: "#f3f4f6",
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 1,
    color: "#111827",
    fontSize: 9.5,
    fontWeight: 700,
    padding: 6,
  },
  matchRow: {
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    display: "flex",
    flexDirection: "row",
    gap: 5,
    padding: 6,
  },
  matchRowLast: {
    borderBottomWidth: 0,
  },
  metaGrid: {
    borderColor: "#d1d5db",
    borderRadius: 4,
    borderWidth: 1,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  metaItem: {
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderRightColor: "#e5e7eb",
    borderRightWidth: 1,
    padding: 8,
    width: "33.333%",
  },
  metaLabel: {
    color: "#6b7280",
    fontSize: 7.5,
    fontWeight: 700,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  metaValue: {
    color: "#111827",
    fontSize: 10,
    lineHeight: 1.3,
  },
  optionLabel: {
    color: "#111827",
    fontSize: 10,
    fontWeight: 700,
    width: 24,
  },
  optionRow: {
    display: "flex",
    flexDirection: "row",
    marginTop: 5,
  },
  optionText: {
    color: "#1f2937",
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
  },
  page: {
    color: "#111827",
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    paddingBottom: 54,
    paddingHorizontal: 42,
    paddingTop: 42,
  },
  paragraph: {
    color: "#1f2937",
    fontSize: 10,
    lineHeight: 1.45,
    marginBottom: 5,
  },
  paragraphCompact: {
    fontSize: 8,
    lineHeight: 1.25,
    marginBottom: 1,
  },
  question: {
    borderBottomColor: "#d1d5db",
    borderBottomWidth: 1,
    marginTop: 13,
    paddingBottom: 12,
  },
  questionHeader: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  questionIntro: {
    marginBottom: 1,
  },
  questionMeta: {
    color: "#6b7280",
    fontSize: 8.5,
    marginBottom: 5,
  },
  questionNumber: {
    color: "#111827",
    flex: 1,
    fontSize: 11,
    fontWeight: 700,
  },
  richImage: {
    maxHeight: 220,
    objectFit: "contain",
    width: "100%",
  },
  richImageFrame: {
    alignSelf: "stretch",
    borderColor: "#d1d5db",
    borderRadius: 4,
    borderWidth: 1,
    marginBottom: 7,
    marginTop: 7,
    maxHeight: 230,
    padding: 4,
  },
  rowLabel: {
    color: "#111827",
    fontSize: 9.5,
    fontWeight: 700,
    width: 19,
  },
  rowText: {
    color: "#1f2937",
    flex: 1,
    fontSize: 9.5,
    lineHeight: 1.35,
  },
  sectionSubtitle: {
    color: "#6b7280",
    fontSize: 10,
    marginTop: 3,
  },
  sectionTitle: {
    color: "#111827",
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
  suggestedWords: {
    color: "#4b5563",
    fontSize: 9,
    fontStyle: "italic",
    marginTop: 5,
  },
  table: {
    borderColor: "#9ca3af",
    borderLeftWidth: 1,
    borderTopWidth: 1,
    marginBottom: 8,
    marginTop: 5,
    width: "100%",
  },
  tableCell: {
    borderBottomColor: "#9ca3af",
    borderBottomWidth: 1,
    borderRightColor: "#9ca3af",
    borderRightWidth: 1,
    minHeight: 18,
    padding: 5,
  },
  tableCellCompact: {
    padding: 4,
  },
  tableCellDense: {
    padding: 3,
  },
  tableCompact: {
    marginBottom: 7,
  },
  tableDense: {
    marginBottom: 6,
  },
  tableEmptyCell: {
    color: "#1f2937",
    fontSize: 8,
    lineHeight: 1.2,
  },
  tableHeaderCell: {
    backgroundColor: "#f3f4f6",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
  },
  title: {
    color: "#111827",
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.2,
    textAlign: "center",
  },
  titleMeta: {
    color: "#4b5563",
    fontSize: 10,
    marginTop: 6,
    textAlign: "center",
  },
});

function renderRichBlocks(blocks, includeImages, prefix, compact = false) {
  return (
    <RichTextPdfRenderer
      blocks={blocks}
      compact={compact}
      includeImages={includeImages}
      prefix={prefix}
      styles={styles}
    />
  );
}

function PaperHeader({ model }) {
  const titleMeta = [model.metaRows.find((row) => row.label === "Exam")?.value]
    .filter(Boolean)
    .join(" | ");

  return (
    <View>
      <Text style={styles.title}>{model.title}</Text>
      {titleMeta && <Text style={styles.titleMeta}>{titleMeta}</Text>}

      {model.metaRows.length > 0 && (
        <View style={styles.metaGrid}>
          {model.metaRows.map((row) => (
            <View key={row.label} style={styles.metaItem}>
              <Text style={styles.metaLabel}>{row.label}</Text>
              <Text style={styles.metaValue}>{row.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function Instructions({ blocks, includeImages }) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <View style={styles.instructions}>
      <Text style={styles.instructionsTitle}>Instructions</Text>
      {renderRichBlocks(blocks, includeImages, "paper-instructions")}
    </View>
  );
}

function MultipleChoiceOptions({ options = [] }) {
  if (!options.length) {
    return <Text style={styles.emptyText}>No options available.</Text>;
  }

  return (
    <View>
      {options.map((option) => (
        <View key={option.id} style={styles.optionRow}>
          <Text style={styles.optionLabel}>{option.label}.</Text>
          <Text style={styles.optionText}>{option.text}</Text>
        </View>
      ))}
    </View>
  );
}

function MatchColumn({ items = [], title }) {
  return (
    <View style={styles.matchColumn}>
      <Text style={styles.matchHeader}>{title}</Text>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={[
            styles.matchRow,
            index === items.length - 1 ? styles.matchRowLast : null,
          ].filter(Boolean)}
          wrap={false}
        >
          <Text style={styles.rowLabel}>{item.label}.</Text>
          <Text style={styles.rowText}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
}

function MatchFollowingColumns({ matchColumns }) {
  if (!matchColumns?.columnA?.length && !matchColumns?.columnB?.length) {
    return <Text style={styles.emptyText}>No matching pairs available.</Text>;
  }

  return (
    <View style={styles.matchGrid}>
      <MatchColumn items={matchColumns.columnA} title="Column A" />
      <View style={[styles.matchColumn, styles.matchColumnDivider]}>
        <Text style={styles.matchHeader}>Column B</Text>
        {matchColumns.columnB.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.matchRow,
              index === matchColumns.columnB.length - 1
                ? styles.matchRowLast
                : null,
            ].filter(Boolean)}
            wrap={false}
          >
            <Text style={styles.rowLabel}>{item.label}.</Text>
            <Text style={styles.rowText}>{item.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function QuestionSpecificContent({ question }) {
  if (question.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    return <MultipleChoiceOptions options={question.options} />;
  }

  if (question.type === QUESTION_TYPES.MATCH_FOLLOWING) {
    return <MatchFollowingColumns matchColumns={question.matchColumns} />;
  }

  if (
    question.type === QUESTION_TYPES.LONG_ANSWER &&
    question.suggestedWordCount
  ) {
    return (
      <Text style={styles.suggestedWords}>
        Suggested answer length: {question.suggestedWordCount} words
      </Text>
    );
  }

  return null;
}

function canRenderInQuestionIntro(block) {
  return block?.type !== "image" && block?.type !== "table";
}

function Question({ includeImages, question }) {
  const promptBlocks = Array.isArray(question.promptBlocks)
    ? question.promptBlocks
    : [];
  const introBlocks =
    promptBlocks.length > 0 && canRenderInQuestionIntro(promptBlocks[0])
      ? [promptBlocks[0]]
      : [];
  const remainingBlocks =
    introBlocks.length > 0 ? promptBlocks.slice(1) : promptBlocks;

  return (
    <View style={styles.question} wrap={!question.keepTogether}>
      <View style={styles.questionIntro} wrap={false}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionNumber}>Q{question.number}.</Text>
          {question.marksLabel && (
            <Text style={styles.marks}>[{question.marksLabel}]</Text>
          )}
        </View>

        {question.typeLabel && (
          <Text style={styles.questionMeta}>{question.typeLabel}</Text>
        )}

        {introBlocks.length > 0 &&
          renderRichBlocks(
            introBlocks,
            includeImages,
            `question-${question.id}-intro`,
          )}
      </View>

      {remainingBlocks.length > 0 &&
        renderRichBlocks(
          remainingBlocks,
          includeImages,
          `question-${question.id}`,
        )}

      {question.instructions && (
        <Text style={styles.suggestedWords}>{question.instructions}</Text>
      )}

      {question.image && (
        <ImagePdfRenderer
          alt={question.image.alt}
          includeImages={includeImages}
          src={question.image.src}
          styles={styles}
        />
      )}

      <QuestionSpecificContent question={question} />
    </View>
  );
}

function PaperQuestions({ includeImages, questions }) {
  if (!questions.length) {
    return <Text style={styles.emptyText}>No questions in this paper.</Text>;
  }

  return (
    <View>
      {questions.map((question) => (
        <Question
          includeImages={includeImages}
          key={question.id}
          question={question}
        />
      ))}
    </View>
  );
}

function Footer({ title }) {
  return (
    <Text
      fixed
      render={({ pageNumber, totalPages }) =>
        `${title} | Page ${pageNumber} of ${totalPages}`
      }
      style={styles.footer}
    />
  );
}

function PaperPdfDocument({
  includeAnswerKey = false,
  includeImages = true,
  includePaper = true,
  model,
}) {
  const pageSize = model.pageSize || "A4";

  return (
    <Document author="QBank" subject="Question Paper" title={model.title}>
      {includePaper && (
        <Page size={pageSize} style={styles.page} wrap>
          <PaperHeader model={model} />
          <Instructions blocks={model.instructions} includeImages={includeImages} />
          <PaperQuestions
            includeImages={includeImages}
            questions={model.questions}
          />
          <Footer title={model.title} />
        </Page>
      )}

      {includeAnswerKey && (
        <Page size={pageSize} style={styles.page} wrap>
          <AnswerKeyPdfSection
            answerKey={model.answerKey}
            includeImages={includeImages}
            renderRichBlocks={(blocks, prefix, compact = false) =>
              renderRichBlocks(blocks, includeImages, prefix, compact)
            }
            styles={styles}
          />
          <Footer title={`${model.title} - Answer Key`} />
        </Page>
      )}
    </Document>
  );
}

export default PaperPdfDocument;
