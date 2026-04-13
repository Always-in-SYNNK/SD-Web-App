export function QualificationItem({ icon, title, org, date, accent }) {
  return (
    <article
      className={`bg-white p-6 rounded-lg flex items-center justify-between hover:scale-[1.01] transition-all cursor-pointer ${
        accent ? "border-l-4 border-amber-600" : ""
      }`}
    >
      <section className="flex items-center space-x-6">
        <figure className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl">
          {icon}
        </figure>
        <section>
          <h4 className="font-bold text-lg text-gray-900">{title}</h4>
          <aside className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <em>🏦 {org}</em>
            <em>📅 {date}</em>
          </aside>
        </section>
      </section>
      <button className="text-gray-400 hover:text-[#035b9d] text-xl">⋮</button>
    </article>
  );
}