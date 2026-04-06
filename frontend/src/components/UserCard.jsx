import "../styles/UserCard.css";

const UserCard = ({ title, description, buttonText, icon, highlight, onClick }) => {
  return (
    <div className={`card ${highlight ? "highlight" : ""}`}>
      <div className="icon">{icon}</div>

      <h2>{title}</h2>
      <p>{description}</p>

      <button className="card-btn" onClick={onClick}>
        {buttonText}
      </button>
    </div>
  );
};

export default UserCard;