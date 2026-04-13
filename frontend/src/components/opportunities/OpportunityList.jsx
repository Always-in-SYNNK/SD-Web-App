import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { OpportunityCard } from "./OpportunityCard";
import { QualificationCard } from "./QualificationCard";

export function OpportunityList({ search, location, nqf, field }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from("opportunities").select("*");

        if (search)   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        if (location) query = query.ilike("location", `%${location}%`);
        if (nqf)      query = query.eq("nqf_level", nqf);
        if (field)    query = query.eq("field", field);

        const { data: oppsData, error: oppsError } = await query;
        if (oppsError) throw new Error(oppsError.message);

        let qualsData, qualsError;

        if (search) {
          ({ data: qualsData, error: qualsError } = await supabase.rpc("search_qualifications", { search_term: search }));
        } else if (field) {
          ({ data: qualsData, error: qualsError } = await supabase.rpc("get_qualifications_by_field", { field_input: field }));
        } else if (nqf) {
          ({ data: qualsData, error: qualsError } = await supabase.rpc("get_qualifications_by_nqf_level", { level_input: nqf }));
        } else {
          ({ data: qualsData, error: qualsError } = await supabase.rpc("get_all_qualifications"));
        }

        if (qualsError) throw new Error(qualsError.message);

        const taggedOpps  = oppsData.map((o) => ({ ...o, _type: "opportunity" }));
        const taggedQuals = qualsData.map((q) => ({ ...q, _type: "qualification" }));
        const combined    = [...taggedOpps, ...taggedQuals];

        setItems(combined);
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    fetchData();
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

  if (items.length === 0) {
    return (
      <section className="flex flex-col items-center justify-center py-24 text-center">
        <p className="font-bold text-gray-700">No results found</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your filters</p>
      </section>
    );
  }

  const oppsCount  = items.filter((i) => i._type === "opportunity").length;
  const qualsCount = items.filter((i) => i._type === "qualification").length;

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <small className="text-sm text-gray-500">
          Showing <strong>{oppsCount}</strong> opportunities and <strong>{qualsCount}</strong> qualifications
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
        {items.map((item) =>
          item._type === "opportunity" ? (
            <OpportunityCard key={`opp-${item.id}`} {...item} />
          ) : (
            <QualificationCard key={`qual-${item.qual_id}`} {...item} />
          )
        )}
      </section>
    </section>
  );
}