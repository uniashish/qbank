import { useCallback, useEffect, useRef, useState } from "react";

import PaperInsertButton from "./PaperInsertButton.jsx";
import PaperInsertMenu from "./PaperInsertMenu.jsx";
import {
  ensureTrailingEmptyParagraph,
  findActiveEmptyParagraph,
} from "./paperInsertUtils.js";

const CONTROL_GUTTER_OFFSET = 38;
const CONTROL_MIN_LEFT = 8;

function getParagraphElement(editor, insertionPoint) {
  const domNode = editor?.view?.nodeDOM(insertionPoint?.pos);

  return domNode instanceof HTMLElement ? domNode : null;
}

function positionsMatch(firstPosition, secondPosition) {
  return (
    firstPosition?.left === secondPosition?.left &&
    firstPosition?.top === secondPosition?.top
  );
}

function insertionPointsMatch(firstPoint, secondPoint) {
  return firstPoint?.pos === secondPoint?.pos;
}

function PaperInsertOverlay({
  editor,
  onAddQuestion,
  onInsertDivider,
  readOnly = false,
}) {
  const [anchorPosition, setAnchorPosition] = useState(null);
  const [insertionPoint, setInsertionPoint] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const controlRef = useRef(null);
  const frameRef = useRef(null);
  const overlayRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      if (!editor || readOnly || !editor.isEditable || !overlayRef.current) {
        setAnchorPosition(null);
        setInsertionPoint(null);
        setIsMenuOpen(false);
        return;
      }

      let nextInsertionPoint = findActiveEmptyParagraph(editor);

      if (!nextInsertionPoint) {
        ensureTrailingEmptyParagraph(editor);
        nextInsertionPoint = findActiveEmptyParagraph(editor);
      }

      const paragraphElement = getParagraphElement(editor, nextInsertionPoint);

      if (!nextInsertionPoint || !paragraphElement) {
        setAnchorPosition(null);
        setInsertionPoint(null);
        setIsMenuOpen(false);
        return;
      }

      const paragraphRect = paragraphElement.getBoundingClientRect();
      const editorRect = editor.view.dom.getBoundingClientRect();
      const overlayRect = overlayRef.current.getBoundingClientRect();
      const paragraphMidpoint = paragraphRect.height > 0
        ? paragraphRect.height / 2
        : 12;
      const nextAnchorPosition = {
        left: Math.max(
          CONTROL_MIN_LEFT,
          Math.round(editorRect.left - overlayRect.left - CONTROL_GUTTER_OFFSET),
        ),
        top: Math.round(paragraphRect.top - overlayRect.top + paragraphMidpoint),
      };

      setAnchorPosition((currentPosition) =>
        positionsMatch(currentPosition, nextAnchorPosition)
          ? currentPosition
          : nextAnchorPosition,
      );
      setInsertionPoint((currentPoint) =>
        insertionPointsMatch(currentPoint, nextInsertionPoint)
          ? currentPoint
          : nextInsertionPoint,
      );
    });
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor || readOnly) {
      return undefined;
    }

    updatePosition();

    editor.on("transaction", updatePosition);
    editor.on("selectionUpdate", updatePosition);
    editor.on("update", updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    const resizeObserver =
      typeof ResizeObserver === "function"
        ? new ResizeObserver(updatePosition)
        : null;

    if (resizeObserver) {
      resizeObserver.observe(editor.view.dom);

      if (overlayRef.current) {
        resizeObserver.observe(overlayRef.current);
      }
    }

    return () => {
      editor.off("transaction", updatePosition);
      editor.off("selectionUpdate", updatePosition);
      editor.off("update", updatePosition);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      resizeObserver?.disconnect();

      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [editor, readOnly, updatePosition]);

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (controlRef.current?.contains(event.target)) {
        return;
      }

      setIsMenuOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      setIsMenuOpen(false);
      controlRef.current?.querySelector(".paper-insert-button")?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  if (!editor || readOnly) {
    return null;
  }

  function handleAddQuestion() {
    setIsMenuOpen(false);
    onAddQuestion?.(insertionPoint);
  }

  function handleInsertDivider() {
    setIsMenuOpen(false);
    onInsertDivider?.(insertionPoint);
  }

  return (
    <div className="paper-insert-overlay" ref={overlayRef}>
      {anchorPosition && insertionPoint && (
        <div
          className="paper-insert-control"
          ref={controlRef}
          style={{
            left: `${anchorPosition.left}px`,
            top: `${anchorPosition.top}px`,
          }}
        >
          <PaperInsertButton
            isOpen={isMenuOpen}
            onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          />
          {isMenuOpen && (
            <PaperInsertMenu
              onAddQuestion={handleAddQuestion}
              onInsertDivider={handleInsertDivider}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default PaperInsertOverlay;
