import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OpportunityCard } from "../opportunities/OpportunityCard";

import {
  getPendingOpportunities,
  getApprovedOpportunities,
  deleteOpportunity,
  approveOpportunity,
  rejectOpportunity,
} from "../../services/opportunityService";

// mode: "pending" | "approved"
export function OpportunitiesTable({ mode = "pending" }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: result, error: fetchError } =
        mode === "pending"
          ? await getPendingOpportunities()
          : await getApprovedOpportunities();

      if (fetchError) setError(fetchError.message);
      else setData(result);

      setLoading(false);
    };

    fetchData();
  }, [mode]); // re-fetch whenever the tab changes

  //abstracted supabase logic to service layer
  const handleDelete = async (id) => {
    const { error } = await deleteOpportunity(id);
    if (error) console.error(error.message);
    else setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApprove = async (id) => {
    const { error } = await approveOpportunity(id);
    if (error) console.error(error.message);
    else setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = async (id) => {
    const { error } = await rejectOpportunity(id);
    if (error) console.error(error.message);
    else setData((prev) => prev.filter((item) => item.id !== id));
  };

  if (loading)
    return <p className="text-sm text-gray-400 py-6 text-center">Loading...</p>;

  if (error)
    return <p className="text-sm text-red-500 py-6 text-center">{error}</p>;

  if (data.length === 0)
    return (
      <p className="text-sm text-gray-400 py-6 text-center">
        No {mode} opportunities.
      </p>
    );

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <OpportunityCard
          key={item.id}
          {...item}
          isAdmin={true}
          // approved view: delete + edit only
          onDelete={mode === "approved" ? handleDelete : undefined}
          onEdit={mode === "approved" ? (id) => navigate(`/opportunities/${id}`) : undefined} 
          // pending view: approve + reject only
          onApprove={mode === "pending" ? handleApprove : undefined}
          onReject={mode === "pending" ? handleReject : undefined}          
        />
      ))}
    </div>
  );
}