import Icon from "../../components/common/Icon.jsx";

function SharedQuestionBadge({ ownerName = "" }) {
  return (
    <span
      className="question-bank-badge question-bank-badge--shared"
      title={ownerName ? `Shared by ${ownerName}` : "Shared question"}
    >
      <Icon name="link" size={14} />
      <span>Shared</span>
    </span>
  );
}

export default SharedQuestionBadge;
