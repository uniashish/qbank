import { useId, useState } from "react";

import EquationTemplateButton from "./EquationTemplateButton.jsx";
import {
  COMMON_MATH_SYMBOL_IDS,
  COMMON_MATH_TEMPLATE_IDS,
  MATH_TEMPLATE_GROUPS,
  getMathTemplateItemsById,
} from "./mathTemplates.js";

const COMMON_TEMPLATE_ITEMS = getMathTemplateItemsById(COMMON_MATH_TEMPLATE_IDS);
const COMMON_SYMBOL_ITEMS = getMathTemplateItemsById(COMMON_MATH_SYMBOL_IDS);

function EquationPaletteRow({ items, label, onInsert }) {
  return (
    <section
      aria-label={label}
      className="rich-text-editor-equation-palette__section"
    >
      <h3>{label}</h3>
      <div className="rich-text-editor-equation-palette__row">
        {items.map((item) => (
          <EquationTemplateButton
            item={item}
            key={item.id}
            onInsert={onInsert}
          />
        ))}
      </div>
    </section>
  );
}

function EquationSymbolPalette({ onInsert }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRegionId = useId();

  return (
    <div
      aria-label="Equation symbols and templates"
      className="rich-text-editor-equation-palette"
    >
      <EquationPaletteRow
        items={COMMON_TEMPLATE_ITEMS}
        label="Common"
        onInsert={onInsert}
      />
      <EquationPaletteRow
        items={COMMON_SYMBOL_ITEMS}
        label="Symbols"
        onInsert={onInsert}
      />

      <button
        aria-controls={expandedRegionId}
        aria-expanded={isExpanded}
        className="rich-text-editor-equation-palette__toggle"
        onClick={() => setIsExpanded((currentValue) => !currentValue)}
        type="button"
      >
        More <span aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div
          className="rich-text-editor-equation-palette__groups"
          id={expandedRegionId}
        >
          {MATH_TEMPLATE_GROUPS.map((group) => (
            <EquationPaletteRow
              items={group.items}
              key={group.id}
              label={group.label}
              onInsert={onInsert}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default EquationSymbolPalette;
