import katex from "katex";

export const MATH_INLINE_NODE_NAME = "mathInline";
export const MATH_BLOCK_NODE_NAME = "mathBlock";

const EMPTY_MATH_FALLBACK = "Empty equation";

export function normalizeLatex(value) {
  return String(value ?? "");
}

export function normalizeMathAttributes(attrs = {}) {
  return {
    latex: normalizeLatex(attrs.latex),
  };
}

export function getMathPlainText(attrs = {}) {
  return normalizeLatex(attrs.latex);
}

export function getMathFallbackText(latexInput) {
  const latex = normalizeLatex(latexInput).trim();

  return latex || EMPTY_MATH_FALLBACK;
}

export function renderLatexToHtml(latexInput, { displayMode = false } = {}) {
  const latex = normalizeLatex(latexInput);

  if (!latex.trim()) {
    return {
      error: null,
      html: "",
      latex,
    };
  }

  try {
    return {
      error: null,
      html: katex.renderToString(latex, {
        displayMode,
        output: "html",
        strict: "ignore",
        throwOnError: true,
        trust: false,
      }),
      latex,
    };
  } catch (error) {
    return {
      error,
      html: "",
      latex,
    };
  }
}
