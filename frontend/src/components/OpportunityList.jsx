import React from "react";
import OpportunityCard from "./OpportunityCard";

const OpportunityList = ({ opportunities }) => {
  if (!opportunities || opportunities.length === 0) {
    return <p>No opportunities found.</p>;
  }

  return (
    <div>
      {opportunities.map((opp) => (
        <OpportunityCard key={opp.id} opportunity={opp} />
      ))}
    </div>
  );
};

export default OpportunityList;