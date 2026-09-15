import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";

function AddBlankButton({ disabled = false, onClick }) {
  return (
    <Button
      className="fill-blanks-add-answer"
      disabled={disabled}
      onClick={onClick}
      variant="secondary"
    >
      <Icon name="plus" size={18} />
      Add accepted answer
    </Button>
  );
}

export default AddBlankButton;
