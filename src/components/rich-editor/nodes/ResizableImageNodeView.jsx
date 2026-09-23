import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";

const MIN_IMAGE_WIDTH = 80;
const MIN_IMAGE_HEIGHT = 48;

function normalizeDimension(value) {
  const numericValue = Number.parseFloat(String(value ?? ""));

  return Number.isFinite(numericValue) && numericValue > 0
    ? Math.round(numericValue)
    : null;
}

function getElementContentWidth(element) {
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const styles = window.getComputedStyle(element);
  const horizontalPadding =
    Number.parseFloat(styles.paddingLeft || "0") +
    Number.parseFloat(styles.paddingRight || "0");
  const width = rect.width - horizontalPadding;

  return Number.isFinite(width) && width > 0 ? width : null;
}

function getMaxImageWidth(wrapperElement) {
  const widthCandidates = [
    getElementContentWidth(wrapperElement?.parentElement),
    getElementContentWidth(wrapperElement?.closest(".rich-text-editor__prose")),
  ].filter(Boolean);

  if (!widthCandidates.length) {
    return null;
  }

  return Math.floor(Math.min(...widthCandidates));
}

function getCurrentImageSize({ attrs, imageElement }) {
  const width = normalizeDimension(attrs.width);
  const height = normalizeDimension(attrs.height);

  if (width && height) {
    return { height, width };
  }

  const rect = imageElement?.getBoundingClientRect();
  const renderedWidth = normalizeDimension(rect?.width);
  const renderedHeight = normalizeDimension(rect?.height);

  return {
    height: height || renderedHeight || MIN_IMAGE_HEIGHT,
    width: width || renderedWidth || MIN_IMAGE_WIDTH,
  };
}

function getAspectRatio({ height, imageElement, width }) {
  if (width && height) {
    return width / height;
  }

  const naturalWidth = normalizeDimension(imageElement?.naturalWidth);
  const naturalHeight = normalizeDimension(imageElement?.naturalHeight);

  if (naturalWidth && naturalHeight) {
    return naturalWidth / naturalHeight;
  }

  return 1;
}

function setNodeSelection({ editor, getPos }) {
  if (!editor || !editor.isEditable || typeof getPos !== "function") {
    return;
  }

  const position = getPos();

  if (Number.isInteger(position)) {
    editor.chain().focus().setNodeSelection(position).run();
  }
}

function ResizableImageNodeView({
  editor,
  getPos,
  node,
  selected = false,
  updateAttributes,
}) {
  const wrapperRef = useRef(null);
  const imageRef = useRef(null);
  const latestSizeRef = useRef(null);
  const [draftSize, setDraftSize] = useState(null);
  const isEditable = Boolean(editor?.isEditable);
  const width = normalizeDimension(node.attrs.width);
  const height = normalizeDimension(node.attrs.height);
  const displayedWidth = draftSize?.width ?? width;
  const displayedHeight = draftSize?.height ?? height;
  const wrapperStyle = useMemo(
    () => ({
      ...(displayedWidth ? { width: `${displayedWidth}px` } : {}),
    }),
    [displayedWidth],
  );
  const imageStyle = useMemo(
    () => ({
      ...(displayedWidth ? { width: "100%" } : {}),
      ...(displayedHeight && displayedWidth
        ? { aspectRatio: `${displayedWidth} / ${displayedHeight}` }
        : {}),
    }),
    [displayedHeight, displayedWidth],
  );

  useEffect(() => {
    latestSizeRef.current = draftSize;
  }, [draftSize]);

  const handleSelectImage = useCallback(() => {
    setNodeSelection({ editor, getPos });
  }, [editor, getPos]);

  const handleResizeStart = useCallback(
    (event) => {
      if (!isEditable) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      setNodeSelection({ editor, getPos });

      const imageElement = imageRef.current;
      const startSize = getCurrentImageSize({
        attrs: node.attrs,
        imageElement,
      });
      const aspectRatio = getAspectRatio({
        height: startSize.height,
        imageElement,
        width: startSize.width,
      });
      const minimumWidth = Math.max(
        MIN_IMAGE_WIDTH,
        Math.ceil(MIN_IMAGE_HEIGHT * aspectRatio),
      );
      const maxWidth = Math.max(
        minimumWidth,
        getMaxImageWidth(wrapperRef.current) || startSize.width,
      );
      const startX = event.clientX;
      const startY = event.clientY;

      function updateDraftSize(pointerEvent) {
        const deltaX = pointerEvent.clientX - startX;
        const deltaY = (pointerEvent.clientY - startY) * aspectRatio;
        const dominantDelta =
          Math.abs(deltaX) >= Math.abs(deltaY) ? deltaX : deltaY;
        const nextWidth = Math.min(
          maxWidth,
          Math.max(minimumWidth, Math.round(startSize.width + dominantDelta)),
        );
        const nextHeight = Math.max(
          MIN_IMAGE_HEIGHT,
          Math.round(nextWidth / aspectRatio),
        );
        const nextSize = {
          height: nextHeight,
          width: nextWidth,
        };

        latestSizeRef.current = nextSize;
        setDraftSize(nextSize);
      }

      function commitDraftSize() {
        const nextSize = latestSizeRef.current;

        window.removeEventListener("pointermove", updateDraftSize);
        window.removeEventListener("pointerup", commitDraftSize);
        window.removeEventListener("pointercancel", commitDraftSize);

        if (nextSize) {
          updateAttributes(nextSize);
        }

        latestSizeRef.current = null;
        setDraftSize(null);
      }

      latestSizeRef.current = startSize;
      setDraftSize(startSize);
      window.addEventListener("pointermove", updateDraftSize);
      window.addEventListener("pointerup", commitDraftSize);
      window.addEventListener("pointercancel", commitDraftSize);
    },
    [editor, getPos, isEditable, node.attrs, updateAttributes],
  );

  return (
    <NodeViewWrapper
      as="figure"
      className={[
        "rich-text-editor-image-node",
        selected ? "rich-text-editor-image-node--selected" : "",
        draftSize ? "rich-text-editor-image-node--resizing" : "",
        !isEditable ? "rich-text-editor-image-node--readonly" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      contentEditable={false}
      data-image-node=""
      ref={wrapperRef}
      style={wrapperStyle}
    >
      <img
        alt={node.attrs.alt || ""}
        className="rich-text-editor__image rich-text-editor-image-node__image"
        draggable={false}
        onMouseDown={handleSelectImage}
        ref={imageRef}
        src={node.attrs.src}
        style={imageStyle}
        title={node.attrs.title || undefined}
      />

      {isEditable && selected && (
        <button
          aria-label="Resize image"
          className="rich-text-editor-image-node__resize-handle"
          onPointerDown={handleResizeStart}
          type="button"
        />
      )}
    </NodeViewWrapper>
  );
}

export default ResizableImageNodeView;
