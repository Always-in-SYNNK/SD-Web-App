import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { OpportunityCard } from "./OpportunityCard";

export function OpportunityList({ search, location, nqf, field }) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      setError(null);

      let query = supabase.from("opportunities").select("*");

      if (search) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (search) query = query.ilike("title", `%${search}%`);
      if (location) query = query.ilike("location", `%${location}%`);
      if (nqf) query = query.eq("nqf_level", nqf);
      if (field) query = query.eq("field", field);

      const { data, error } = await query;

      if (error) {
        setError(error.message);
      } else {
        setOpportunities(data);
      }

      setLoading(false);
    };

    fetchOpportunities();
  }, [search, location, nqf, field]);

  if (loading) {
    return (
      <section className="flex items-center justify-center py-24">
        <i className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin block" role="status" aria-label="Loading" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-bold text-red-600">Something went wrong</p>
        <p className="text-sm text-gray-400 mt-1">{error}</p>
      </section>
    );
  }

  if (opportunities.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-bold text-gray-700">No opportunities found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <small className="text-sm text-gray-500">
          Showing <strong>{opportunities.length}</strong> verified opportunities
        </small>
        <nav className="flex items-center gap-2">
          <small className="text-xs font-bold uppercase tracking-widest text-gray-400">Sort by:</small>
          <select className="bg-transparent border-none text-sm font-bold text-[#035b9d] focus:ring-0">
            <option>Recently Added</option>
            <option>Closing Soon</option>
            <option>Highest Stipend</option>
          </select>
        </nav>
      </header>

      <section className="flex flex-col gap-4">
        {opportunities.map((opp) => (
          <OpportunityCard key={opp.id} {...opp} />
        ))}
      </section>
    </section>
  );
}