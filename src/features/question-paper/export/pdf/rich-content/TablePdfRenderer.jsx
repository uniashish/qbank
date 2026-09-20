import { Text, View } from "@react-pdf/renderer";

function getColumnWidth(columnCount) {
  return `${100 / Math.max(columnCount, 1)}%`;
}

function getTableDensity(columnCount) {
  if (columnCount >= 7) {
    return "dense";
  }

  if (columnCount >= 5) {
    return "compact";
  }

  return "normal";
}

function createEmptyCell(cellIndex) {
  return {
    blocks: [],
    id: `empty-cell-${cellIndex + 1}`,
    isHeader: false,
    plainText: "",
  };
}

function TableCell({
  cell,
  columnCount,
  density,
  renderCellBlocks,
  styles,
}) {
  const hasRichBlocks = cell.blocks.length > 0;

  return (
    <View
      style={[
        styles.tableCell,
        { width: getColumnWidth(columnCount) },
        cell.isHeader ? styles.tableHeaderCell : null,
        density === "compact" ? styles.tableCellCompact : null,
        density === "dense" ? styles.tableCellDense : null,
      ].filter(Boolean)}
    >
      {hasRichBlocks ? (
        renderCellBlocks(cell.blocks, cell.id)
      ) : (
        <Text style={styles.tableEmptyCell}> </Text>
      )}
    </View>
  );
}

function TablePdfRenderer({ block, renderCellBlocks, styles }) {
  const columnCount = Math.max(block.columnCount || 0, 1);
  const density = getTableDensity(columnCount);

  return (
    <View
      style={[
        styles.table,
        density === "compact" ? styles.tableCompact : null,
        density === "dense" ? styles.tableDense : null,
      ].filter(Boolean)}
    >
      {block.rows.map((row) => {
        const cells = [...row.cells];

        while (cells.length < columnCount) {
          cells.push(createEmptyCell(cells.length));
        }

        return (
          <View key={row.id} style={styles.tableRow}>
            {cells.map((cell) => (
              <TableCell
                cell={cell}
                columnCount={columnCount}
                density={density}
                key={cell.id}
                renderCellBlocks={renderCellBlocks}
                styles={styles}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

export default TablePdfRenderer;
