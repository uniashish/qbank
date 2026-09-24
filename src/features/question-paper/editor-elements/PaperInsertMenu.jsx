import { useEffect, useRef } from "react";

import Icon from "../../../components/common/Icon.jsx";

function PaperInsertMenu({ onAddQuestion, onInsertDivider }) {
  const firstItemRef = useRef(null);

  useEffect(() => {
    firstItemRef.current?.focus();
  }, []);

  return (
    <div aria-label="Insert paper element" className="paper-insert-menu" role="menu">
      <button
        className="paper-insert-menu-item"
        onClick={onAddQuestion}
        ref={firstItemRef}
        role="menuitem"
        type="button"
      >
        <Icon name="plus" size={16} />
        <span>Add Question</span>
      </button>
      <button
        className="paper-insert-menu-item"
        onClick={onInsertDivider}
        role="menuitem"
        type="button"
      >
        <span aria-hidden="true" className="paper-insert-menu-item__divider-icon" />
        <span>Horizontal Divider</span>
      </button>
    </div>
  );
}

export default PaperInsertMenu;
