import React from "react";
import "../styles/OpportunityCard.css";

const OpportunityCard = ({ opportunity }) => {
  return (
    <div className="card">
      <h3>{opportunity.title}</h3>
      <p>{opportunity.description}</p>
      <p><strong>Provider:</strong> {opportunity.provider}</p>
      <p><strong>Location:</strong> {opportunity.location}</p>
    </div>
  );
};

export default OpportunityCard;