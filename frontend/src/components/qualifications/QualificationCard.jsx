import { useNavigate } from "react-router-dom";

export function QualificationCard({ qual_id, title, nqf_level, field, subfield, originator, min_credits }) {
  const navigate = useNavigate();

  const formattedCredits = min_credits
    ? `${min_credits} credits`
    : "Credits unspecified";

  return (
    <article
      onClick={() => navigate(`/qualifications/${qual_id}`)}
      className="bg-white p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center relative group border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer"
    >
      <figure className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">
        📜
      </figure>
      <section className="flex-1 space-y-1 text-center md:text-left">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mt-1">{subfield ?? field}</p>
        <section className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 pt-2 text-xs">
          {nqf_level   && <strong>🎓 NQF Level {nqf_level}</strong>}
          {field       && <strong>📚 {field}</strong>}
          {originator  && <strong>🏛️ {originator}</strong>}
          {min_credits && <strong>⭐ {formattedCredits}</strong>}
        </section>
      </section>
      <nav className="flex flex-row md:flex-col gap-3 shrink-0">
        <button
          onClick={() => navigate(`/qualifications/${qual_id}`)}
          className="px-6 py-2.5 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition min-w-[100px]"
        >
          View
        </button>
      </nav>
    </article>
  );
}