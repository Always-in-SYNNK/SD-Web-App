export function OpportunityCard() {
  return (
    <article className="bg-white p-8 rounded-xl shadow-sm flex space-x-6">
      <figure className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5eqW1Di9qw6IY4-NAvf9b-S7Omc13z9ncXBmGvRSzJ4BXwjkdkUKjRb-cRaDnLnUGDgKx4_eC7RNjb5A1Y5qYoTepcJ4C9FyDvCo_ktu98lnDWNEZS3mkJL7mm6Rek9PVdX_OfEVACrR2SqINqKMZy87pPS6gLAbeI9jWORe3h2K2vxfoUTUPXZ9zOZvU8fCZlpIfdDNid7abRyy4GC6ZzGQg5joVi25Bi-qbulMgRl1OsoEPahOlHef8-xIUovI7cZGhCD-Mw7NR"
          alt="Opportunity"
          className="w-full h-full object-cover"
        />
      </figure>
      <section>
        <strong className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase mb-2 inline-block">
          Matched Opportunity
        </strong>
        <h5 className="font-bold text-lg mb-1">Senior Urban Designer</h5>
        <p className="text-sm text-gray-500 mb-4">
          Based on your Level 7 NQF verified architecture degree.
        </p>
        <a href="#" className="text-[#035b9d] font-bold text-sm hover:underline flex items-center gap-1">
          View Requirements →
        </a>
      </section>
    </article>
  );
}