import React from "react";
import OpportunityCard from "./OpportunityCard";

const OpportunityList = ({ opportunities }) => {
  if (!opportunities || opportunities.length === 0) {
    return <p>No opportunities found.</p>;
  }

  return (
    <ul>
      {opportunities.map((opp) => (
        <li key={opp.id}><OpportunityCard opportunity={opp} /></li>
      ))}
    </ul>
  );
};

export default OpportunityList;