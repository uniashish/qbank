import Icon from "../../../components/common/Icon.jsx";

function PaperInsertButton({ isOpen = false, onClick }) {
  return (
    <button
      aria-expanded={isOpen}
      aria-haspopup="menu"
      aria-label="Insert paper element"
      className="paper-insert-button"
      onClick={onClick}
      type="button"
    >
      <Icon name="plus" size={17} />
    </button>
  );
}

export default PaperInsertButton;
