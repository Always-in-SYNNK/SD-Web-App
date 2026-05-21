export function OpportunityRow({ item }) {
  return (
    <article className="p-6 bg-white rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-sm transition">
      <section className="flex-1">
        <h3 className="font-bold text-gray-900">{item.title}</h3>
        <p className="text-sm text-gray-500">{item.provider}</p>
      </section>
      <p className="text-sm text-gray-500 w-32 text-center">{item.type}</p>
      <p className={`text-sm font-semibold w-24 text-center ${
        item.status === "Live" ? "text-green-600" : "text-red-500"
      }`}>
        {item.status}
      </p>
      <div className="flex gap-2">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition font-bold" aria-label={`Edit ${item.title}`}>Edit</button>
        <button className="p-2 hover:bg-red-50 rounded-lg transition font-bold" aria-label={`Remove ${item.title}`}>Remove</button>
      </div>
    </article>
  );
}