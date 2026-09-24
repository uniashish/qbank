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

export const EQUATION_DIALOG_MODES = {
  EDIT: "edit",
  INSERT: "insert",
};

const EQUATION_TYPE_VALUES = new Set(Object.values(EQUATION_TYPES));
const MATH_NODE_TYPES = new Set([MATH_INLINE_NODE_NAME, MATH_BLOCK_NODE_NAME]);

export function normalizeEquationType(value) {
  return EQUATION_TYPE_VALUES.has(value) ? value : EQUATION_TYPES.INLINE;
}

export function normalizeEquationLatex(value) {
  return String(value ?? "").trim();
}

export function isMathNodeType(nodeType) {
  return MATH_NODE_TYPES.has(nodeType);
}

export function getEquationTypeFromNodeType(nodeType) {
  return nodeType === MATH_BLOCK_NODE_NAME
    ? EQUATION_TYPES.BLOCK
    : EQUATION_TYPES.INLINE;
}

export function getEquationNodeType(type) {
  return normalizeEquationType(type) === EQUATION_TYPES.BLOCK
    ? MATH_BLOCK_NODE_NAME
    : MATH_INLINE_NODE_NAME;
}

export function createInsertEquationRequest() {
  return {
    latex: "",
    mode: EQUATION_DIALOG_MODES.INSERT,
    nodeType: MATH_INLINE_NODE_NAME,
    position: null,
  };
}

export function createEditEquationRequest({ latex, nodeType, position }) {
  return {
    latex: String(latex ?? ""),
    mode: EQUATION_DIALOG_MODES.EDIT,
    nodeType: isMathNodeType(nodeType) ? nodeType : MATH_INLINE_NODE_NAME,
    position: Number.isInteger(position) ? position : null,
  };
}

export function getInitialEquationDialogState(request = null) {
  const nodeType = request?.nodeType;

  return {
    error: "",
    latex: String(request?.latex ?? ""),
    type: getEquationTypeFromNodeType(nodeType),
  };
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
