export function OpportunityFilters() {
  return (
    <aside className="space-y-8">
      <section className="bg-[#f5f3f3] p-6 rounded-xl">
        <header className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Filters</h3>
          <button className="text-[#035b9d] text-xs font-bold uppercase tracking-widest">Reset</button>
        </header>
        <section className="space-y-6">
          <section className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Sector</label>
            <section className="space-y-2">
              {["Tech & IT", "Trades & Artisan", "Finance & Banking"].map((sector, i) => (
                <label key={sector} className="flex items-center gap-3 cursor-pointer">
                  <span className="w-5 h-5 rounded border border-gray-300 flex items-center justify-center">
                    <span className={`w-3 h-3 bg-[#035b9d] rounded-sm ${i === 0 ? "opacity-100" : "opacity-0"}`} />
                  </span>
                  <strong className="text-sm font-medium">{sector}</strong>
                </label>
              ))}
            </section>
          </section>

          <section className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Province</label>
            <select className="w-full bg-gray-100 border-none rounded-lg text-sm py-3 px-3">
              <option>Gauteng</option>
              <option>Western Cape</option>
              <option>KwaZulu-Natal</option>
              <option>Eastern Cape</option>
              <option>Free State</option>
            </select>
          </section>

          <section className="space-y-3">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">NQF Level</label>
            <nav className="flex flex-wrap gap-2">
              {["NQF 4", "NQF 5", "NQF 6", "NQF 7"].map((level) => (
                <button
                  key={level}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                    level === "NQF 5"
                      ? "bg-[#035b9d] text-white"
                      : "bg-white text-gray-700 hover:bg-[#035b9d] hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </nav>
          </section>
        </section>
      </section>

      <section className="bg-[#035b9d] p-6 rounded-xl text-white">
        <h4 className="font-bold text-lg">Premium Match</h4>
        <p className="text-sm text-blue-100 mt-2">
          Based on your NQF 5 profile, you are eligible for the Cloud Architecture program.
        </p>
        <button className="mt-4 bg-green-200 text-green-900 w-full py-2 rounded-full font-bold text-sm">
          View Match
        </button>
      </section>
    </aside>
  );
}