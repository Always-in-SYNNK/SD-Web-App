/**
 * @param {{
 *   recommendations: Array<{
 *     id: string|number,
 *     title: string,
 *     company: string,
 *     type: string,       // e.g. "Permanent", "Internship"
 *     badge: string,      // e.g. "High Match", "New Opportunity"
 *   }>,
 *   skillScore?: number,
 *   qualification?: string,
 * }} props
 */
export function RecommendedPanel({ recommendations = [], skillScore, qualification }) {
  const BADGE_STYLES = {
    "High Match": "text-[#006e2d] bg-[#f5f3f3]",
    "New Opportunity": "text-[#006e2d] bg-[#f5f3f3]",
  };

  return (
    <aside className="bg-[#f5f3f3] p-8 rounded-xl">
      <h2 className="text-xl font-bold mb-2">Recommended for You</h2>

      {(qualification || skillScore) && (
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          Based on your{qualification ? ` ${qualification}` : " profile"}
          {skillScore ? ` and ${skillScore}% Skill Verification score` : ""}.
        </p>
      )}

      <ul className="space-y-6">
        {recommendations.map((rec) => (
          <li key={rec.id} className="group cursor-pointer">
            <section className="flex items-start justify-between mb-1">
              <h4 className="font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors leading-snug">
                {rec.title}
              </h4>
              <span
                className={`ml-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-tight shrink-0 ${
                  BADGE_STYLES[rec.badge] ?? "text-gray-600 bg-gray-100"
                }`}
              >
                {rec.badge}
              </span>
            </section>
            <p className="text-xs text-gray-400 font-medium">
              {rec.company} • {rec.type}
            </p>
          </li>
        ))}
      </ul>

      <a
        href="/opportunities"
        className="mt-8 w-full block text-center border border-gray-300 text-gray-800 text-sm font-bold py-3 rounded-full hover:bg-white transition-all"
      >
        Explore All Matches
      </a>
    </aside>
  );
}
