import { useState, useEffect } from "react";
import { OpportunityCard } from "../opportunities/OpportunityCard";
import { useAuth } from "../../context/useAuth";

import {
  getPendingOpportunities,
  getApprovedOpportunities,
  deleteOpportunity,
  approveOpportunity,
  rejectOpportunity,
} from "../../services/opportunityService";

// mode: "pending" | "approved"
export function OpportunitiesTable({ mode = "pending" }) {
  const auth = useAuth();
  const currentUser = auth?.user;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getErrorMessage = (err, fallback) =>
    err?.response?.data?.error || err?.message || fallback;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      const { data: result, error: fetchError } =
        mode === "pending"
          ? await getPendingOpportunities()
          : await getApprovedOpportunities();

      if (fetchError) {
        const message = getErrorMessage(fetchError, "Failed to load opportunities");
        setError(message);
        alert(message);
      }
      else setData(result);

      setLoading(false);
    };

    fetchData();
  }, [mode]); // re-fetch whenever the tab changes

  //abstracted supabase logic to service layer
  const handleDelete = async (id) => {
    const { error: deleteError } = await deleteOpportunity(id);
    if (deleteError) alert(getErrorMessage(deleteError, "Failed to delete opportunity"));
    else setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApprove = async (id) => {
    const { error: approveError } = await approveOpportunity(id);
    if (approveError) alert(getErrorMessage(approveError, "Failed to approve opportunity"));
    else setData((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReject = async (id) => {
    const { error: rejectError } = await rejectOpportunity(id);
    if (rejectError) alert(getErrorMessage(rejectError, "Failed to reject opportunity"));
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
    <section className="space-y-4">
      {data.map((item) => {
        const isOwnOpportunity = item.provider_profiles?.profile_id === currentUser?.profileId;
        return (
          <OpportunityCard
            key={item.id}
            {...item}
            isAdmin={true}
            isOwnOpportunity={isOwnOpportunity}
          // approved view: delete + edit only
          onDelete={mode === "approved" ? handleDelete : undefined}
          disableDelete={mode === "approved" && isOwnOpportunity}

          // Disabled for now: admin users cannot access /opportunities/:id (applicant-only route).
          // onEdit={mode === "approved" ? (id) => navigate(`/opportunities/${id}`) : undefined}
          
          // pending view: approve + reject only
          onApprove={mode === "pending" ? handleApprove : undefined}
          onReject={mode === "pending" ? handleReject : undefined}
          
          disableApprove={mode === "pending" && isOwnOpportunity}
          disableReject={mode === "pending" && isOwnOpportunity}
          
        />
      )})}
    </section>
  );
}