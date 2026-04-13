import { useNavigate } from "react-router-dom";

export function OpportunityCard({ id, title, description, location, duration, stipend, closing_date }) {
  const navigate = useNavigate();

  const formattedStipend = stipend
    ? `R${Number(stipend).toLocaleString()}/month`
    : "Unpaid";

  const formattedDate = closing_date
    ? new Date(closing_date).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No closing date";

  return (
    <article
      onClick={() => navigate(`/opportunities/${id}`)}
      className="bg-white p-6 rounded-xl flex flex-col md:flex-row gap-6 items-center relative group border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300 cursor-pointer"
    >
      <figure className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 text-2xl">
        🎓
      </figure>
      <section className="flex-1 space-y-1 text-center md:text-left">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#035b9d] transition-colors">
          {title}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{description}</p>
        <section className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-400 pt-2 text-xs">
          {location && <strong>📍 {location}</strong>}
          {duration && <strong>🕐 {duration}</strong>}
          {stipend && <strong>💰 {formattedStipend}</strong>}
          <time dateTime={closing_date || undefined}>📅 Closes {formattedDate}</time>
        </section>
      </section>
      <nav className="flex flex-row md:flex-col gap-3 shrink-0">
        <button
          onClick={(e) => e.stopPropagation()}
          className="px-6 py-2.5 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition min-w-[100px]"
        >
          Apply
        </button>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-2.5 bg-gray-100 rounded-full hover:bg-blue-100 transition flex items-center justify-center"
        >
          🔖
        </button>
      </nav>
    </article>
  );
}