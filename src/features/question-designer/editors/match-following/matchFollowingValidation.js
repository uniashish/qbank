export const MIN_MATCH_FOLLOWING_PAIRS = 2;
export const MAX_MATCH_FOLLOWING_PAIRS = 12;

function normalizePairValue(value) {
  return String(value ?? "").trim().toLowerCase();
}

function createDuplicateCounts(pairs, fieldName) {
  return pairs.reduce((counts, pair) => {
    const normalizedValue = normalizePairValue(pair?.[fieldName]);

    if (!normalizedValue) {
      return counts;
    }

    counts.set(normalizedValue, (counts.get(normalizedValue) ?? 0) + 1);

    return counts;
  }, new Map());
}

export function validateMatchFollowing(matchFollowing = {}) {
  const pairs = Array.isArray(matchFollowing.pairs)
    ? matchFollowing.pairs
    : [];
  const errors = {
    pairTexts: {},
  };

  if (pairs.length < MIN_MATCH_FOLLOWING_PAIRS) {
    errors.pairs = `Add at least ${MIN_MATCH_FOLLOWING_PAIRS} matching pairs.`;
  } else if (pairs.length > MAX_MATCH_FOLLOWING_PAIRS) {
    errors.pairs = `Use no more than ${MAX_MATCH_FOLLOWING_PAIRS} matching pairs.`;
  }

  const leftCounts = createDuplicateCounts(pairs, "left");
  const rightCounts = createDuplicateCounts(pairs, "right");

  pairs.forEach((pair) => {
    const pairId = pair?.id;
    const leftValue = normalizePairValue(pair?.left);
    const rightValue = normalizePairValue(pair?.right);

    if (!pairId) {
      errors.pairs = "Every matching pair must have a stable ID.";
      return;
    }

    if (!errors.pairTexts[pairId]) {
      errors.pairTexts[pairId] = {};
    }

    if (!leftValue) {
      errors.pairTexts[pairId].left = "Enter Column A text.";
    } else if (leftCounts.get(leftValue) > 1) {
      errors.pairTexts[pairId].left = "Column A values must be unique.";
    }

    if (!rightValue) {
      errors.pairTexts[pairId].right = "Enter Column B text.";
    } else if (rightCounts.get(rightValue) > 1) {
      errors.pairTexts[pairId].right = "Column B values must be unique.";
    }

    if (Object.keys(errors.pairTexts[pairId]).length === 0) {
      delete errors.pairTexts[pairId];
    }
  });

  if (Object.keys(errors.pairTexts).length === 0) {
    delete errors.pairTexts;
  }

  return errors;
}

export function hasMatchFollowingValidationErrors(errors = {}) {
  return Object.keys(errors).length > 0;
}

export function isMatchFollowingValid(matchFollowing) {
  return !hasMatchFollowingValidationErrors(
    validateMatchFollowing(matchFollowing),
  );
}
