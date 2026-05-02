import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Sidebar } from "../components/dashboard/Sidebar";

export default function QualificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qualification, setQualification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQualification = async () => {
      const { data, error } = await supabase
        .from("qualifications")
        .select("*")
        .eq("qual_id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setQualification(data);
      }
      setLoading(false);
    };

    fetchQualification();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#faf9f8]">
        <Sidebar activePage="/qualifications" />
        <section className="ml-64 flex-1 flex items-center justify-center">
          <i className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin block" role="status" aria-label="Loading" />
        </section>
      </main>
    );
  }

  if (error || !qualification) {
    return (
      <main className="flex min-h-screen bg-[#faf9f8]">
        <Sidebar activePage="/qualifications" />
        <section className="ml-64 flex-1 flex items-center justify-center">
          <section className="text-center">
            <p className="font-bold text-red-600">Qualification not found</p>
            <button
              onClick={() => navigate("/qualifications")}
              className="mt-4 text-[#035b9d] font-bold hover:underline"
            >
              Back to qualifications
            </button>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/qualifications" />
      <section className="ml-64 min-h-screen w-full p-12">

        {/* Back button */}
        <button
          onClick={() => navigate("/qualifications")}
          className="flex items-center gap-2 text-gray-500 hover:text-[#035b9d] text-sm font-medium mb-8 transition-colors"
        >
          ← Back to qualifications
        </button>

        {/* Header */}
        <header className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
          <section className="flex items-start gap-6">
            <figure className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center text-4xl shrink-0">
              🎓
            </figure>
            <section>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                {qualification.qualification_title ?? qualification.title}
              </h1>
              <section className="flex flex-wrap gap-4 text-sm text-gray-500">
                {qualification.field && <strong>📚 {qualification.field}</strong>}
                {qualification.subfield && <strong>🔍 {qualification.subfield}</strong>}
                {qualification.nqf_level && <strong>📊 NQF Level {qualification.nqf_level}</strong>}
                {qualification.originator && <strong>🏛️ {qualification.originator}</strong>}
              </section>
            </section>
          </section>
        </header>

        {/* Info cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "NQF Level", value: qualification.nqf_level ? `Level ${qualification.nqf_level}` : "Not specified" },
            { label: "Field", value: qualification.field || "Not specified" },
            { label: "Subfield", value: qualification.subfield || "Not specified" },
            { label: "Originator", value: qualification.originator || "Not specified" },
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
        {qualification.description && (
          <section className="bg-white rounded-xl border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-bold mb-4">About this qualification</h2>
            <p className="text-gray-600 leading-relaxed">{qualification.description}</p>
          </section>
        )}

      </section>
    </main>
  );
}