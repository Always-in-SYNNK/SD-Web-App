export function OpportunityFilters({
  location,
  nqfLevel,
  field,
  setLocation,
  setNqfLevel,
  setField,
  onReset,
  onViewMatch,
  loading = false,
}) {
  const SA_PROVINCES = [
    "Eastern Cape",
    "Free State",
    "Gauteng",
    "KwaZulu-Natal",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "Western Cape",
    "Remote/Other",
  ];

  const NQF_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const FIELDS = [
    "Human and Social Studies",
    "Physical, Mathematical, Computer and Life Sciences",
    "Law, Military Science and Security",
    "Culture and Arts",
    "Manufacturing, Engineering and Technology",
    "Services",
    "Health Sciences and Social Services",
    "Business, Commerce and Management Studies",
    "Physical Planning and Construction",
    "Agriculture and Nature Conservation",
    "Education, Training and Development",
    "Communication Studies and Language",
  ];

  return (
    <aside className="space-y-8">
      <section className="bg-[#f5f3f3] p-6 rounded-xl">
        <header className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">Filters</h3>
          <button
            onClick={onReset}
            className="text-[#035b9d] text-xs font-bold uppercase tracking-widest hover:underline"
          >
            Reset
          </button>
        </header>

        <section className="space-y-6">

          {/* Province */}
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
              {SA_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
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
              disabled={loading}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All NQF Levels</option>
              {NQF_LEVELS.map((level) => (
                <option key={level} value={level}>
                  NQF Level {level}
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
              disabled={loading}
              className="w-full bg-white border border-gray-200 rounded-lg text-sm py-3 px-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="">All Fields</option>
              {FIELDS.map((f) => (
                <option key={f} value={f}>
                  {f}
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
        <button
          type="button"
          onClick={onViewMatch}
          disabled={loading}
          className="mt-4 bg-green-200 text-green-900 w-full py-2 rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Match
        </button>
      </section>
    </aside>
  );
}