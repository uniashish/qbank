export const MAX_TAG_COUNT = 10;
export const MAX_TAG_LENGTH = 50;

export function normalizeTagText(value) {
  return String(value ?? "").trim();
}

export function getTagKey(value) {
  return normalizeTagText(value).toLowerCase();
}

export function sanitizeTags(tags = []) {
  if (!Array.isArray(tags)) {
    return [];
  }

  const seenTagKeys = new Set();
  const sanitizedTags = [];

  tags.forEach((tag) => {
    if (typeof tag !== "string") {
      return;
    }

    const trimmedTag = normalizeTagText(tag);
    const tagKey = getTagKey(trimmedTag);

    if (!trimmedTag || seenTagKeys.has(tagKey)) {
      return;
    }

    seenTagKeys.add(tagKey);
    sanitizedTags.push(trimmedTag);
  });

  return sanitizedTags;
}

export function validateTags(tags = []) {
  if (tags == null) {
    return "";
  }

  if (!Array.isArray(tags)) {
    return "Tags must be a list.";
  }

  if (tags.length > MAX_TAG_COUNT) {
    return `Add ${MAX_TAG_COUNT} tags or fewer.`;
  }

  const seenTagKeys = new Set();

  for (const tag of tags) {
    if (typeof tag !== "string") {
      return "Tags must be text.";
    }

    const trimmedTag = normalizeTagText(tag);

    if (!trimmedTag) {
      return "Remove empty tags.";
    }

    if (trimmedTag.length > MAX_TAG_LENGTH) {
      return `Tags must be ${MAX_TAG_LENGTH} characters or fewer.`;
    }

    const tagKey = getTagKey(trimmedTag);

    if (seenTagKeys.has(tagKey)) {
      return "Tags must be unique.";
    }

    seenTagKeys.add(tagKey);
  }

  return "";
}

export function addTag(tags = [], rawTag = "") {
  const currentTags = sanitizeTags(tags);
  const nextTag = normalizeTagText(rawTag);

  if (!nextTag) {
    return {
      error: "Enter a tag before adding it.",
      tags: currentTags,
    };
  }

  if (nextTag.length > MAX_TAG_LENGTH) {
    return {
      error: `Tags must be ${MAX_TAG_LENGTH} characters or fewer.`,
      tags: currentTags,
    };
  }

  if (currentTags.length >= MAX_TAG_COUNT) {
    return {
      error: `Add ${MAX_TAG_COUNT} tags or fewer.`,
      tags: currentTags,
    };
  }

  const nextTagKey = getTagKey(nextTag);

  if (currentTags.some((tag) => getTagKey(tag) === nextTagKey)) {
    return {
      error: "That tag is already added.",
      tags: currentTags,
    };
  }

  return {
    error: "",
    tags: [...currentTags, nextTag],
  };
}

export function addTags(tags = [], rawTags = []) {
  const candidates = Array.isArray(rawTags) ? rawTags : [rawTags];
  let nextTags = sanitizeTags(tags);
  let error = "";

  candidates.forEach((candidate) => {
    if (!normalizeTagText(candidate)) {
      return;
    }

    const result = addTag(nextTags, candidate);
    nextTags = result.tags;
    error = result.error || error;
  });

  return {
    error,
    tags: nextTags,
  };
}

export function removeTag(tags = [], tagToRemove = "") {
  const tagKeyToRemove = getTagKey(tagToRemove);

  return sanitizeTags(tags).filter((tag) => getTagKey(tag) !== tagKeyToRemove);
}
