import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Sidebar } from "../components/dashboard/Sidebar";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunity = async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setOpportunity(data);
      }
      setLoading(false);
    };

    fetchOpportunity();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#faf9f8]">
        <Sidebar activePage="/opportunities" />
        <section className="ml-64 flex-1 flex items-center justify-center">
          <i className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin block" role="status" aria-label="Loading" />
        </section>
      </main>
    );
  }

  if (error || !opportunity) {
    return (
      <main className="flex min-h-screen bg-[#faf9f8]">
        <Sidebar activePage="/opportunities" />
        <section className="ml-64 flex-1 flex items-center justify-center">
          <section className="text-center">
            <p className="font-bold text-red-600">Opportunity not found</p>
            <button
              onClick={() => navigate("/opportunities")}
              className="mt-4 text-[#035b9d] font-bold hover:underline"
            >
              Back to opportunities
            </button>
          </section>
        </section>
      </main>
    );
  }

  const formattedStipend = opportunity.stipend
    ? `R${Number(opportunity.stipend).toLocaleString()}/month`
    : "Unpaid";

  const formattedDate = opportunity.closing_date
    ? new Date(opportunity.closing_date).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "No closing date";

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/opportunities" />
      <section className="ml-64 min-h-screen w-full p-12">

        {/* Back button */}
        <button
          onClick={() => navigate("/opportunities")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#035b9d] text-sm font-medium mb-8 transition-colors"
        >
          ← Back to opportunities
        </button>

        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
          <section className="flex items-start justify-between gap-6">
            <section className="flex items-center gap-6">
              <figure className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-4xl shrink-0">
                🎓
              </figure>
              <section>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                  {opportunity.title}
                </h1>
                <section className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {opportunity.location && <strong>📍 {opportunity.location}</strong>}
                  {opportunity.duration && <strong>🕐 {opportunity.duration}</strong>}
                  {opportunity.stipend && <strong>💰 {formattedStipend}</strong>}
                  <time>📅 Closes {formattedDate}</time>
                </section>
              </section>
            </section>
            <button className="px-8 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition shrink-0">
              Apply Now
            </button>
          </section>
        </header>

        {/* Info cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Stipend", value: formattedStipend },
            { label: "Duration", value: opportunity.duration || "Not specified" },
            { label: "Location", value: opportunity.location || "Not specified" },
            { label: "Closing Date", value: formattedDate },
          ].map(({ label, value }) => (
            <article key={label} className="bg-white rounded-xl border border-gray-100 p-5">
              <strong className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">
                {label}
              </strong>
              <strong className="font-bold text-gray-900">{value}</strong>
            </article>
          ))}
        </section>

        {/* Description */}
        <section className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
          <h2 className="text-xl font-bold mb-4">About this opportunity</h2>
          <p className="text-gray-600 leading-relaxed">{opportunity.description}</p>
        </section>

        {/* Apply */}
        <section className="bg-[#035b9d] rounded-xl p-8 flex items-center justify-between">
          <article>
            <h3 className="text-white font-bold text-xl mb-1">Ready to apply?</h3>
            <p className="text-blue-100 text-sm">Submit your application before {formattedDate}</p>
          </article>
          <button className="px-8 py-3 bg-white text-[#035b9d] rounded-full font-bold text-sm hover:opacity-90 transition">
            Apply Now
          </button>
        </section>

      </section>
    </main>
  );
}