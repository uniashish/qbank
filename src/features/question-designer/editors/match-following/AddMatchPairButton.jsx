import Button from "../../../../components/common/Button.jsx";
import Icon from "../../../../components/common/Icon.jsx";

function AddMatchPairButton({ disabled = false, onClick }) {
  return (
    <Button
      className="match-following-add-pair"
      disabled={disabled}
      onClick={onClick}
      variant="secondary"
    >
      <Icon name="plus" size={18} />
      Add Pair
    </Button>
  );
}

export default AddMatchPairButton;
