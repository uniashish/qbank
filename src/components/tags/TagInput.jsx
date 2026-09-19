import { useCallback, useId, useState } from "react";

import FormField from "../common/FormField.jsx";
import TagChip from "./TagChip.jsx";
import {
  addTag,
  addTags,
  MAX_TAG_COUNT,
  MAX_TAG_LENGTH,
  removeTag,
  sanitizeTags,
} from "./tagUtils.js";

function TagInput({
  error = "",
  id,
  label = "Tags (optional)",
  onChange,
  placeholder = "Type a tag and press Enter...",
  value = [],
}) {
  const generatedId = useId();
  const inputId = id ?? `tag-input-${generatedId}`;
  const tags = sanitizeTags(value);
  const [draftTag, setDraftTag] = useState("");
  const [inputError, setInputError] = useState("");
  const visibleError = error || inputError;

  const commitTags = useCallback(
    (nextTags, nextError = "") => {
      setInputError(nextError);

      if (nextTags !== tags && typeof onChange === "function") {
        onChange(nextTags);
      }
    },
    [onChange, tags],
  );

  const handleAddTag = useCallback(() => {
    const result = addTag(tags, draftTag);

    commitTags(result.tags, result.error);

    if (!result.error) {
      setDraftTag("");
    }
  }, [commitTags, draftTag, tags]);

  const handleDraftChange = useCallback(
    (event) => {
      const nextValue = event.target.value;

      if (!nextValue.includes(",")) {
        setDraftTag(nextValue);

        if (inputError) {
          setInputError("");
        }

        return;
      }

      const tagParts = nextValue.split(",");
      const completedTagParts = tagParts.slice(0, -1);
      const remainingTagPart = tagParts[tagParts.length - 1] ?? "";
      const result = addTags(tags, completedTagParts);

      commitTags(result.tags, result.error);
      setDraftTag(remainingTagPart);
    },
    [commitTags, inputError, tags],
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key !== "Enter" && event.key !== ",") {
        return;
      }

      event.preventDefault();
      handleAddTag();
    },
    [handleAddTag],
  );

  const handleRemoveTag = useCallback(
    (tag) => {
      commitTags(removeTag(tags, tag), "");
    },
    [commitTags, tags],
  );

  return (
    <FormField
      error={visibleError}
      htmlFor={inputId}
      label={label}
    >
      <div
        className={[
          "tag-input",
          visibleError ? "tag-input--invalid" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="tag-input__control">
          {tags.map((tag) => (
            <TagChip key={tag.toLowerCase()} label={tag} onRemove={handleRemoveTag} />
          ))}
          <input
            aria-describedby={visibleError ? `${inputId}-error` : undefined}
            aria-invalid={visibleError ? "true" : undefined}
            aria-label={label}
            className="tag-input__input"
            disabled={tags.length >= MAX_TAG_COUNT}
            id={inputId}
            maxLength={MAX_TAG_LENGTH + 1}
            onChange={handleDraftChange}
            onKeyDown={handleKeyDown}
            placeholder={tags.length ? "" : placeholder}
            type="text"
            value={draftTag}
          />
        </div>
      </div>
    </FormField>
  );
}

export default TagInput;
