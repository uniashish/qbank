const DEFAULT_PAIR_ID_PREFIX = "pair";

function trimText(value) {
  return String(value ?? "").trim();
}

function getPairIdNumber(pairId, prefix = DEFAULT_PAIR_ID_PREFIX) {
  const pairNumber = Number(String(pairId ?? "").replace(`${prefix}-`, ""));

  return Number.isInteger(pairNumber) ? pairNumber : 0;
}

export function createMatchPair(pairNumber, prefix = DEFAULT_PAIR_ID_PREFIX) {
  return {
    id: `${prefix}-${pairNumber}`,
    left: "",
    right: "",
  };
}

export function normalizeMatchPairs(pairs = [], { minPairs = 0 } = {}) {
  const normalizedPairs = Array.isArray(pairs)
    ? pairs.map((pair, index) => ({
        id: pair?.id || `${DEFAULT_PAIR_ID_PREFIX}-${index + 1}`,
        left: pair?.left ?? "",
        right: pair?.right ?? "",
      }))
    : [];

  while (normalizedPairs.length < minPairs) {
    normalizedPairs.push(createMatchPair(normalizedPairs.length + 1));
  }

  return normalizedPairs;
}

export function getMatchPairIdCounterSeed(pairs = []) {
  return normalizeMatchPairs(pairs).reduce(
    (highestPairNumber, pair, index) =>
      Math.max(
        highestPairNumber,
        getPairIdNumber(pair.id),
        index + 1,
      ),
    0,
  );
}

export function createPersistableMatchPairs(pairs = []) {
  return normalizeMatchPairs(pairs).map((pair) => ({
    id: pair.id,
    left: trimText(pair.left),
    right: trimText(pair.right),
  }));
}

export function deriveDeterministicColumnBOrder(pairs = []) {
  const pairIds = normalizeMatchPairs(pairs)
    .map((pair) => pair.id)
    .filter(Boolean);

  if (pairIds.length <= 1) {
    return pairIds;
  }

  return [pairIds[pairIds.length - 1], ...pairIds.slice(0, -1)];
}

export function resolveColumnBDisplayPairs(pairs = [], displayOrder = null) {
  const normalizedPairs = normalizeMatchPairs(pairs);
  const pairById = new Map(normalizedPairs.map((pair) => [pair.id, pair]));
  const orderedIds = Array.isArray(displayOrder)
    ? displayOrder
    : deriveDeterministicColumnBOrder(normalizedPairs);
  const seenPairIds = new Set();
  const displayPairs = [];

  orderedIds.forEach((pairId) => {
    const pair = pairById.get(pairId);

    if (!pair || seenPairIds.has(pairId)) {
      return;
    }

    seenPairIds.add(pairId);
    displayPairs.push(pair);
  });

  normalizedPairs.forEach((pair) => {
    if (!seenPairIds.has(pair.id)) {
      displayPairs.push(pair);
    }
  });

  return displayPairs;
}

export function createMatchDisplayModel(pairs = [], displayOrder = null) {
  const leftPairs = normalizeMatchPairs(pairs);
  const rightPairs = resolveColumnBDisplayPairs(leftPairs, displayOrder);
  const rightIndexByPairId = new Map(
    rightPairs.map((pair, index) => [pair.id, index]),
  );

  return {
    leftPairs,
    rightPairs,
    mappings: leftPairs.map((pair, index) => ({
      leftIndex: index,
      pairId: pair.id,
      rightIndex: rightIndexByPairId.get(pair.id),
    })),
  };
}
