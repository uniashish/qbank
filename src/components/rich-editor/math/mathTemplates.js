export const MATH_TEMPLATE_GROUPS = [
  {
    id: "basic",
    label: "Basic",
    items: [
      {
        id: "plus-minus",
        label: "±",
        latex: "\\pm",
        ariaLabel: "Insert plus or minus",
        selectionMode: "after",
      },
      {
        id: "times",
        label: "×",
        latex: "\\times",
        ariaLabel: "Insert multiplication sign",
        selectionMode: "after",
      },
      {
        id: "divide",
        label: "÷",
        latex: "\\div",
        ariaLabel: "Insert division sign",
        selectionMode: "after",
      },
      {
        id: "equals",
        label: "=",
        latex: "=",
        ariaLabel: "Insert equals sign",
        selectionMode: "after",
      },
      {
        id: "not-equals",
        label: "≠",
        latex: "\\ne",
        ariaLabel: "Insert not equals sign",
        selectionMode: "after",
      },
      {
        id: "less-than",
        label: "<",
        latex: "<",
        ariaLabel: "Insert less than sign",
        selectionMode: "after",
      },
      {
        id: "greater-than",
        label: ">",
        latex: ">",
        ariaLabel: "Insert greater than sign",
        selectionMode: "after",
      },
      {
        id: "less-than-or-equal",
        label: "≤",
        latex: "\\le",
        ariaLabel: "Insert less than or equal to sign",
        selectionMode: "after",
      },
      {
        id: "greater-than-or-equal",
        label: "≥",
        latex: "\\ge",
        ariaLabel: "Insert greater than or equal to sign",
        selectionMode: "after",
      },
      {
        id: "infinity",
        label: "∞",
        latex: "\\infty",
        ariaLabel: "Insert infinity",
        selectionMode: "after",
      },
    ],
  },
  {
    id: "fractions-powers",
    label: "Fractions / powers",
    items: [
      {
        id: "fraction",
        label: "Fraction",
        shortLabel: "a/b",
        latex: "\\frac{#?}{#?}",
        ariaLabel: "Insert fraction",
      },
      {
        id: "square",
        label: "Square",
        shortLabel: "x²",
        latex: "#@^{2}",
        ariaLabel: "Insert square",
      },
      {
        id: "power",
        label: "Power",
        shortLabel: "xⁿ",
        latex: "#@^{#?}",
        ariaLabel: "Insert power",
      },
      {
        id: "subscript",
        label: "Subscript",
        shortLabel: "xₙ",
        latex: "#@_{#?}",
        ariaLabel: "Insert subscript",
      },
    ],
  },
  {
    id: "roots",
    label: "Roots",
    items: [
      {
        id: "square-root",
        label: "Square Root",
        shortLabel: "√",
        latex: "\\sqrt{#?}",
        ariaLabel: "Insert square root",
      },
      {
        id: "nth-root",
        label: "Nth Root",
        shortLabel: "ⁿ√",
        latex: "\\sqrt[#?]{#?}",
        ariaLabel: "Insert nth root",
      },
    ],
  },
  {
    id: "summation-products",
    label: "Summation / products",
    items: [
      {
        id: "summation",
        label: "Σ",
        latex: "\\sum_{#?}^{#?}#?",
        ariaLabel: "Insert summation",
      },
      {
        id: "product",
        label: "Product",
        shortLabel: "Π",
        latex: "\\prod_{#?}^{#?}#?",
        ariaLabel: "Insert product",
      },
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    items: [
      {
        id: "integral",
        label: "Integral",
        shortLabel: "∫",
        latex: "\\int #?\\,d#?",
        ariaLabel: "Insert integral",
      },
      {
        id: "definite-integral",
        label: "Definite Integral",
        shortLabel: "∫ᵇₐ",
        latex: "\\int_{#?}^{#?}#?\\,d#?",
        ariaLabel: "Insert definite integral",
      },
      {
        id: "limit",
        label: "Limit",
        shortLabel: "lim",
        latex: "\\lim_{#?\\to #?}#?",
        ariaLabel: "Insert limit",
      },
    ],
  },
  {
    id: "greek",
    label: "Greek letters",
    items: [
      {
        id: "pi",
        label: "π",
        latex: "\\pi",
        ariaLabel: "Insert pi",
        selectionMode: "after",
      },
      {
        id: "theta",
        label: "θ",
        latex: "\\theta",
        ariaLabel: "Insert theta",
        selectionMode: "after",
      },
      {
        id: "alpha",
        label: "α",
        latex: "\\alpha",
        ariaLabel: "Insert alpha",
        selectionMode: "after",
      },
      {
        id: "beta",
        label: "β",
        latex: "\\beta",
        ariaLabel: "Insert beta",
        selectionMode: "after",
      },
      {
        id: "gamma",
        label: "γ",
        latex: "\\gamma",
        ariaLabel: "Insert gamma",
        selectionMode: "after",
      },
      {
        id: "delta",
        label: "δ",
        latex: "\\delta",
        ariaLabel: "Insert delta",
        selectionMode: "after",
      },
      {
        id: "lambda",
        label: "λ",
        latex: "\\lambda",
        ariaLabel: "Insert lambda",
        selectionMode: "after",
      },
      {
        id: "mu",
        label: "μ",
        latex: "\\mu",
        ariaLabel: "Insert mu",
        selectionMode: "after",
      },
      {
        id: "capital-delta",
        label: "Δ",
        latex: "\\Delta",
        ariaLabel: "Insert capital delta",
        selectionMode: "after",
      },
      {
        id: "capital-omega",
        label: "Ω",
        latex: "\\Omega",
        ariaLabel: "Insert capital omega",
        selectionMode: "after",
      },
    ],
  },
  {
    id: "functions",
    label: "Functions",
    items: [
      {
        id: "sin",
        label: "sin",
        latex: "\\sin\\left(#?\\right)",
        ariaLabel: "Insert sine function",
      },
      {
        id: "cos",
        label: "cos",
        latex: "\\cos\\left(#?\\right)",
        ariaLabel: "Insert cosine function",
      },
      {
        id: "tan",
        label: "tan",
        latex: "\\tan\\left(#?\\right)",
        ariaLabel: "Insert tangent function",
      },
      {
        id: "log",
        label: "log",
        latex: "\\log\\left(#?\\right)",
        ariaLabel: "Insert logarithm",
      },
      {
        id: "ln",
        label: "ln",
        latex: "\\ln\\left(#?\\right)",
        ariaLabel: "Insert natural logarithm",
      },
    ],
  },
  {
    id: "brackets",
    label: "Brackets",
    items: [
      {
        id: "parentheses",
        label: "( )",
        latex: "\\left(#?\\right)",
        ariaLabel: "Insert parentheses",
      },
      {
        id: "square-brackets",
        label: "[ ]",
        latex: "\\left[#?\\right]",
        ariaLabel: "Insert square brackets",
      },
      {
        id: "braces",
        label: "{ }",
        latex: "\\left\\{#?\\right\\}",
        ariaLabel: "Insert braces",
      },
      {
        id: "absolute-value",
        label: "| |",
        latex: "\\left|#?\\right|",
        ariaLabel: "Insert absolute value bars",
      },
    ],
  },
];

const MATH_TEMPLATE_ITEMS_BY_ID = Object.fromEntries(
  MATH_TEMPLATE_GROUPS.flatMap((group) =>
    group.items.map((item) => [item.id, item]),
  ),
);

export const COMMON_MATH_TEMPLATE_IDS = [
  "fraction",
  "square-root",
  "square",
  "subscript",
  "summation",
  "integral",
];

export const COMMON_MATH_SYMBOL_IDS = [
  "pi",
  "theta",
  "plus-minus",
  "less-than-or-equal",
  "greater-than-or-equal",
  "infinity",
];

export function getMathTemplateItemsById(ids) {
  return ids
    .map((id) => MATH_TEMPLATE_ITEMS_BY_ID[id])
    .filter(Boolean);
}
