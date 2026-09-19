import { Link } from "react-router-dom";

function SignupChoiceCard({ description, title, to }) {
  return (
    <Link className="signup-choice-card" to={to}>
      <span className="signup-choice-card__icon" aria-hidden="true">
        {title.charAt(0)}
      </span>
      <span className="signup-choice-card__content">
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
    </Link>
  );
}

export default SignupChoiceCard;
