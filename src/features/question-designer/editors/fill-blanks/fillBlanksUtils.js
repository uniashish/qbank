export const BLANK_MARKER = "[blank]";
export const MAX_FILL_BLANK_ACCEPTED_ANSWERS = 10;
export const MAX_FILL_BLANKS = 10;

const BLANK_MARKER_PATTERN = /\[blank\]/g;

function toAcceptedAnswerList(acceptedAnswers) {
  if (!Array.isArray(acceptedAnswers) || acceptedAnswers.length === 0) {
    return [""];
  }

  return acceptedAnswers.map((answer) => String(answer ?? ""));
}

function createBlankId(position, usedIds) {
  const preferredId = `blank-${position}`;

  if (!usedIds.has(preferredId)) {
    usedIds.add(preferredId);
    return preferredId;
  }

  let suffix = position + 1;
  let nextId = `blank-${suffix}`;

  while (usedIds.has(nextId)) {
    suffix += 1;
    nextId = `blank-${suffix}`;
  }

  usedIds.add(nextId);
  return nextId;
}

function normalizeBlank(blank, position, usedIds) {
  const existingBlankId =
    typeof blank?.id === "string" ? blank.id.trim() : "";
  const blankId =
    existingBlankId && !usedIds.has(existingBlankId)
      ? existingBlankId
      : createBlankId(position, usedIds);

  if (existingBlankId && blankId === existingBlankId) {
    usedIds.add(blankId);
  }

  return {
    id: blankId,
    acceptedAnswers: toAcceptedAnswerList(blank?.acceptedAnswers),
  };
}

export function countBlankMarkers(prompt) {
  return String(prompt ?? "").match(BLANK_MARKER_PATTERN)?.length ?? 0;
}

export function syncBlankAnswers(fillBlanks = {}, prompt = "") {
  const markerCount = countBlankMarkers(prompt);
  const targetBlankCount = Math.min(markerCount, MAX_FILL_BLANKS);
  const currentBlanks = Array.isArray(fillBlanks.blanks)
    ? fillBlanks.blanks
    : [];
  const usedIds = new Set();

  return {
    blanks: Array.from({ length: targetBlankCount }, (_, index) => {
      const existingBlank = currentBlanks[index];

      if (existingBlank) {
        return normalizeBlank(existingBlank, index + 1, usedIds);
      }

      return {
        id: createBlankId(index + 1, usedIds),
        acceptedAnswers: [""],
      };
    }),
  };
}
