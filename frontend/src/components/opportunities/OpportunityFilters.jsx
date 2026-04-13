export function OpportunityFilters({ location, setLocation, nqf, setNqf, field, setField }) {
  const provinces = [
    "All Provinces",
    "Gauteng",
    "Western Cape",
    "KwaZulu-Natal",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "North West",
    "Northern Cape",
  ];

  const nqfLevels = [
    "All NQF Levels",
    "NQF Level 1",
    "NQF Level 2",
    "NQF Level 3",
    "NQF Level 4",
    "NQF Level 5",
    "NQF Level 6",
    "NQF Level 7",
    "NQF Level 8",
    "NQF Level 9",
    "NQF Level 10",
  ];

  const fields = [
    "All Fields",
    "Agriculture & Nature",
    "Architecture & Construction",
    "Arts, Culture & Design",
    "Banking & Finance",
    "Business & Management",
    "Education & Training",
    "Engineering & Technology",
    "Health & Medical Sciences",
    "Hospitality & Tourism",
    "Human Resources",
    "Information Technology",
    "Law & Legal Studies",
    "Logistics & Supply Chain",
    "Manufacturing & Production",
    "Marketing & Communications",
    "Mining & Resources",
    "Public Administration",
    "Real Estate & Property",
    "Retail & Sales",
    "Social Work & Community",
    "Trades & Artisan",
    "Transport & Aviation",
  ];

  return (
    <aside className="space-y-8">
      <section className="bg-[#f5f3f3] p-6 rounded-xl">
        <header className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Filters</h3>
          <button
            onClick={() => {
              setLocation("");
              setNqf("");
              setField("");
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
              onChange={(e) => setLocation(e.target.value === "All Provinces" ? "" : e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {provinces.map((p) => (
                <option key={p} value={p === "All Provinces" ? "" : p}>{p}</option>
              ))}
            </select>
          </section>

          {/* NQF Level */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              NQF Level
            </label>
            <select
              value={nqf}
              onChange={(e) => setNqf(e.target.value === "All NQF Levels" ? "" : e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {nqfLevels.map((n) => (
                <option key={n} value={n === "All NQF Levels" ? "" : n}>{n}</option>
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
              onChange={(e) => setField(e.target.value === "All Fields" ? "" : e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {fields.map((f) => (
                <option key={f} value={f === "All Fields" ? "" : f}>{f}</option>
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