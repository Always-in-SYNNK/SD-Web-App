export function OpportunityCard({ title, company, description, location, duration, nqf, featured }) {
  return (
    <article className={`bg-white p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center relative group border border-gray-100 hover:shadow-lg transition-all duration-300 ${featured ? "border-l-4 border-l-amber-600" : ""}`}>
      <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">
        🎓
      </div>
      <div className="flex-1 space-y-1 text-center md:text-left">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors">{title}</h3>
        <p className="text-[#035b9d] text-sm font-semibold">{company}</p>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{description}</p>
        <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400 pt-2 text-xs">
          <span>📍 {location}</span>
          <span>🕐 {duration}</span>
          <span>🏆 {nqf}</span>
        </div>
      </div>
      <div className="flex flex-row md:flex-col gap-3 shrink-0">
        <button className="px-6 py-2.5 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition min-w-[100px]">
          Apply
        </button>
        <button className="p-2.5 bg-gray-100 rounded-full hover:bg-blue-100 transition flex items-center justify-center">
          🔖
        </button>
      </div>
    </article>
  );
}