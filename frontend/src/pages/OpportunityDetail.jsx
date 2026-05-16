import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Sidebar } from "../components/dashboard/Sidebar";
import { applyToOpportunity, fetchMyApplications } from "../services/myApplicationService";

export default function OpportunityDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [skills, setSkills] = useState([]);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (!opportunity?.provider_id) return;
    
    const fetchProvider = async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("*")
        .eq("id", opportunity.provider_id);

      //console.log("PROVIDER DATA:", data, error);
      if (!error && data?.length) setProvider(data[0]);
    };

    fetchProvider();
  }, [opportunity?.provider_id]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/opportunity/${id}`);
        const data = await res.json();
        if (data.success) setSkills(data.opportunitySkills || []);
      } catch (err) {
        console.error("Failed to fetch opportunity skills:", err);
      }
    };
    fetchSkills();
  }, [id]);

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
        //console.log("OPPORTUNITY DATA:", data);
        setOpportunity(data);
      }
      setLoading(false);
    };

    fetchOpportunity();
  }, [id]);

  useEffect(() => {
    const fetchAppliedState = async () => {
      try {
        const applications = await fetchMyApplications();
        const isAlreadyApplied = (applications || []).some((application) => {
          const applicationOpportunity = Array.isArray(application?.opportunities)
            ? application.opportunities[0]
            : application?.opportunities;

          return String(applicationOpportunity?.id) === String(id);
        });

        setApplied(isAlreadyApplied);
      } catch {
        setApplied(false);
      }
    };

    fetchAppliedState();
  }, [id]);

  const handleApply = async (event) => {
    event.stopPropagation();

    if (applied || applying) {
      return;
    }

    try {
      setApplying(true);
      await applyToOpportunity(id);
      setApplied(true);
    } catch (err) {
      const message = err?.response?.data?.error || "Failed to apply";

      if (String(message).toLowerCase().includes("already applied")) {
        setApplied(true);
      }

      alert(message);
    } finally {
      setApplying(false);
    }
  };

  const applyButtonLabel = applied ? "Applied" : applying ? "Applying..." : "Apply Now";
  const applyButtonClasses = applied
    ? "px-8 py-3 bg-green-500 text-white rounded-full font-bold text-sm hover:opacity-90 transition shrink-0 disabled:opacity-100"
    : "px-8 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition shrink-0 disabled:opacity-60";

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
            <button
              type="button"
              onClick={handleApply}
              disabled={applied || applying}
              className={applyButtonClasses}
            >
              {applyButtonLabel}
            </button>
          </section>
        </header>

        {provider && (
          <section className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">Provider Details</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {provider.organisation_name && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Organisation</dt>
                  <dd className="font-bold text-gray-900">{provider.organisation_name}</dd>
                </div>
              )}
              {provider.organisation_type && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Type</dt>
                  <dd className="font-bold text-gray-900">{provider.organisation_type}</dd>
                </div>
              )}
              {provider.contact_person && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Contact Person</dt>
                  <dd className="font-bold text-gray-900">{provider.contact_person}</dd>
                </div>
              )}
              {provider.phone_number && (
                <div>
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</dt>
                  <dd className="font-bold text-gray-900">{provider.phone_number}</dd>
                </div>
              )}
              {provider.description && (
                <div className="md:col-span-2">
                  <dt className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">About</dt>
                  <dd className="text-gray-600 leading-relaxed">{provider.description}</dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Info cards */}
        <section className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Stipend", value: formattedStipend },
            { label: "Duration", value: opportunity.duration || "Not specified" },
            { label: "Location", value: opportunity.location || "Not specified" },
            { label: "Closing Date", value: formattedDate },
            { label: "Field", value: opportunity.field || "Not specified" },
            { label: "Required NQF Level", value: opportunity.nqf_level ? `NQF Level ${opportunity.nqf_level}` : "Not specified" },
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

        {skills.length > 0 && (
          <section className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill.id}
                  className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        

        {/* Apply */}
        <section className="bg-[#035b9d] rounded-xl p-8 flex items-center justify-between">
          <article>
            <h3 className="text-white font-bold text-xl mb-1">Ready to apply?</h3>
            <p className="text-blue-100 text-sm">Submit your application before {formattedDate}</p>
          </article>
          <button
            type="button"
            onClick={handleApply}
            disabled={applied || applying}
            className={`px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition ${
              applied
                ? "bg-green-200 text-green-900 disabled:opacity-100"
                : "bg-white text-[#035b9d] disabled:opacity-60"
            }`}
          >
            {applyButtonLabel}
          </button>
        </section>

      </section>
    </main>
  );
}