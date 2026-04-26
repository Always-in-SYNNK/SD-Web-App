import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { OpportunityCard } from "../opportunities/OpportunityCard";

export function OpportunitiesTable() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOpportunities = async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*");

      if (error) {
        console.error(error.message);
      } else {
        setData(data);
      }
    };

    fetchOpportunities();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase
      .from("opportunities")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error.message);
    } else {
      setData((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <OpportunityCard
          key={item.id}
          {...item}
          isAdmin={true}
          onEdit={(id) => navigate(`/opportunities/${id}`)}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}