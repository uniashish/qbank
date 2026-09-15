import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";

function AddOptionButton({ disabled = false, onClick }) {
  return (
    <Button
      className="multiple-choice-add-option"
      disabled={disabled}
      onClick={onClick}
      variant="secondary"
    >
      <Icon name="plus" size={18} />
      Add Option
    </Button>
  );
}

export default AddOptionButton;
