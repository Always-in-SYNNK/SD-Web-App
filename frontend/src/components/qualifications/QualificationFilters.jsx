export function QualificationFilters({
  nqfLevel,
  field,
  setNqfLevel,
  setField,
  onReset,
  loading = false,
}) {
  const NQF_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const FIELDS = [
    "Field 001 - Agriculture and Nature Conservation",
    "Field 002 - Culture and Arts",
    "Field 003 - Business, Commerce and Management Studies",
    "Field 004 - Communication Studies and Language",
    "Field 005 - Education, Training and Development",
    "Field 006 - Manufacturing, Engineering and Technology",
    "Field 007 - Human and Social Studies",
    "Field 008 - Law, Military Science and Security",
    "Field 009 - Health Sciences and Social Services",
    "Field 010 - Physical, Mathematical, Computer and Life Sciences",
    "Field 011 - Services",
    "Field 012 - Physical Planning and Construction",
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
    </aside>
  );
}