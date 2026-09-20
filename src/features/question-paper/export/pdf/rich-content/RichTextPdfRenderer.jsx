import TiptapNodeRenderer from "./TiptapNodeRenderer.jsx";

function RichTextPdfRenderer({
  blocks = [],
  compact = false,
  includeImages = true,
  prefix = "rich-text",
  styles,
}) {
  function renderBlocks(
    nestedBlocks,
    nestedPrefix,
    options = {},
  ) {
    return (
      <RichTextPdfRenderer
        blocks={nestedBlocks}
        compact={options.compact ?? compact}
        includeImages={options.includeImages ?? includeImages}
        prefix={nestedPrefix}
        styles={styles}
      />
    );
  }

  return (
    <>
      {blocks.map((block, index) => (
        <TiptapNodeRenderer
          block={block}
          compact={compact}
          includeImages={includeImages}
          key={`${prefix}-${block.type}-${index}`}
          prefix={`${prefix}-${index}`}
          renderBlocks={renderBlocks}
          styles={styles}
        />
      ))}
    </>
  );
}

export default RichTextPdfRenderer;
