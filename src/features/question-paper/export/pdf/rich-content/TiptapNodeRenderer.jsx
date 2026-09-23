import { Text, View } from "@react-pdf/renderer";

import ImagePdfRenderer from "./ImagePdfRenderer.jsx";
import TablePdfRenderer from "./TablePdfRenderer.jsx";

function getHeadingStyle(level, styles) {
  if (level <= 1) {
    return styles.headingBlockLevelOne;
  }

  if (level === 2) {
    return styles.headingBlockLevelTwo;
  }

  return styles.headingBlockLevelThree;
}

function getRunTextDecoration(run) {
  if (run.underline) {
    return "underline";
  }

  if (run.strike) {
    return "line-through";
  }

  return "";
}

function InlineRuns({ runs = [], styles }) {
  return (
    <>
      {runs.map((run, index) => {
        const textDecoration = getRunTextDecoration(run);

        return (
          <Text
            key={`${run.text}-${index}`}
            style={[
              run.bold ? styles.inlineBold : null,
              run.italic ? styles.inlineItalic : null,
              textDecoration ? { textDecoration } : null,
              run.superscript ? styles.inlineSuperscript : null,
              run.subscript ? styles.inlineSubscript : null,
            ].filter(Boolean)}
          >
            {run.text}
          </Text>
        );
      })}
    </>
  );
}

function ParagraphBlock({ block, compact, styles }) {
  return (
    <Text
      style={[
        styles.paragraph,
        compact ? styles.paragraphCompact : null,
        block.align ? { textAlign: block.align } : null,
      ].filter(Boolean)}
    >
      <InlineRuns runs={block.runs} styles={styles} />
    </Text>
  );
}

function HeadingBlock({ block, compact, styles }) {
  return (
    <Text
      style={[
        styles.headingBlock,
        getHeadingStyle(block.level, styles),
        compact ? styles.headingBlockCompact : null,
        block.align ? { textAlign: block.align } : null,
      ].filter(Boolean)}
    >
      <InlineRuns runs={block.runs} styles={styles} />
    </Text>
  );
}

function ListBlock({
  block,
  compact,
  includeImages,
  prefix,
  renderBlocks,
  styles,
}) {
  return (
    <View style={[styles.list, compact ? styles.listCompact : null].filter(Boolean)}>
      {block.items.map((item, itemIndex) => (
        <View key={item.id} style={styles.listItem}>
          <Text style={styles.bullet}>
            {block.ordered ? `${block.start + itemIndex}.` : "-"}
          </Text>
          <View style={styles.listItemBody}>
            {renderBlocks(item.blocks, `${prefix}-${item.id}`, {
              compact,
              includeImages,
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function TiptapNodeRenderer({
  block,
  compact = false,
  includeImages = true,
  prefix,
  renderBlocks,
  styles,
}) {
  if (!block) {
    return null;
  }

  if (block.type === "heading") {
    return <HeadingBlock block={block} compact={compact} styles={styles} />;
  }

  if (block.type === "list") {
    return (
      <ListBlock
        block={block}
        compact={compact}
        includeImages={includeImages}
        prefix={prefix}
        renderBlocks={renderBlocks}
        styles={styles}
      />
    );
  }

  if (block.type === "table") {
    return (
      <TablePdfRenderer
        block={block}
        renderCellBlocks={(cellBlocks, cellPrefix) =>
          renderBlocks(cellBlocks, `${prefix}-${cellPrefix}`, {
            compact: true,
            includeImages,
          })
        }
        styles={styles}
      />
    );
  }

  if (block.type === "image") {
    return (
      <ImagePdfRenderer
        alt={block.alt}
        height={block.height}
        includeImages={includeImages}
        src={block.src}
        styles={styles}
        width={block.width}
      />
    );
  }

  if (block.type === "paragraph") {
    return <ParagraphBlock block={block} compact={compact} styles={styles} />;
  }

  return null;
}

export default TiptapNodeRenderer;
