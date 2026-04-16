export function OpportunityFilters({ location, nqfLevel, field, setLocation, setNqfLevel, setField, locations = [], nqfLevels = [], fields = [], onReset, loading = false,
}) {
  return (
    <aside className="space-y-8">
      <section className="bg-[#f5f3f3] p-6 rounded-xl">
        <header className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Filters</h3>
          <button
            onClick={() => {
              onReset
            }}
            className="text-[#035b9d] text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Reset
          </button>
        </header>

        <section className="space-y-6">

          {/* Location */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Province
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All Provinces</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </section>

          {/* NQF Level */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              NQF Level
            </label>
            <select
              value={nqfLevel}
              onChange={(e) => setNqfLevel(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All NQF Levels</option>
              {nqfLevels.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </section>

          {/* Field */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Field
            </label>
            <select
              value={field}
              onChange={(e) => setField(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All Fields</option>
              {fields.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </section>
        </section>
      </section>

      <section className="bg-[#035b9d] p-6 rounded-xl text-white">
        <h4 className="font-bold text-lg">Premium Match</h4>
        <p className="text-sm text-blue-100 mt-2">
          Based on your NQF profile, you may be eligible for exclusive opportunities.
        </p>
        <button className="mt-4 bg-green-200 text-green-900 w-full py-2 rounded-full font-bold text-sm hover:opacity-90 transition">
          View Match
        </button>
      </section>
    </aside>
  );
}
