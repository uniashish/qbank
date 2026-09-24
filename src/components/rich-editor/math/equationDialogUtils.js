import {
  MATH_BLOCK_NODE_NAME,
  MATH_INLINE_NODE_NAME,
  getMathFallbackText,
  renderLatexToHtml,
} from "./mathUtils.js";

export const EQUATION_TYPES = {
  BLOCK: "block",
  INLINE: "inline",
};

const EQUATION_TYPE_VALUES = new Set(Object.values(EQUATION_TYPES));

export function normalizeEquationType(value) {
  return EQUATION_TYPE_VALUES.has(value) ? value : EQUATION_TYPES.INLINE;
}

export function normalizeEquationLatex(value) {
  return String(value ?? "").trim();
}

export function getInitialEquationDialogState() {
  return {
    error: "",
    latex: "",
    type: EQUATION_TYPES.INLINE,
  };
}

export function getEquationNodeType(type) {
  return normalizeEquationType(type) === EQUATION_TYPES.BLOCK
    ? MATH_BLOCK_NODE_NAME
    : MATH_INLINE_NODE_NAME;
}

export function createEquationNodeContent({ latex, type }) {
  return {
    attrs: {
      latex: normalizeEquationLatex(latex),
    },
    type: getEquationNodeType(type),
  };
}

export function validateEquationDialogInput({ latex, type }) {
  const normalizedLatex = normalizeEquationLatex(latex);
  const normalizedType = normalizeEquationType(type);

  if (!normalizedLatex) {
    return {
      error: "Enter an equation.",
      isValid: false,
      latex: normalizedLatex,
      type: normalizedType,
    };
  }

  const preview = renderLatexToHtml(normalizedLatex, {
    displayMode: normalizedType === EQUATION_TYPES.BLOCK,
  });

  return {
    canRender: !preview.error,
    error: "",
    isValid: true,
    latex: normalizedLatex,
    type: normalizedType,
  };
}

export function getEquationPreviewState({ latex, type }) {
  const normalizedLatex = normalizeEquationLatex(latex);
  const normalizedType = normalizeEquationType(type);

  if (!normalizedLatex) {
    return {
      canRender: false,
      fallbackText: "",
      html: "",
      isEmpty: true,
      type: normalizedType,
    };
  }

  const preview = renderLatexToHtml(normalizedLatex, {
    displayMode: normalizedType === EQUATION_TYPES.BLOCK,
  });

  return {
    canRender: !preview.error && Boolean(preview.html),
    fallbackText: getMathFallbackText(normalizedLatex),
    html: preview.html,
    isEmpty: false,
    type: normalizedType,
  };
}
