const NQF_LEVELS = [
  { value: 4, label: "NQF Level 4 (Matric)" },
  { value: 5, label: "NQF Level 5 (Higher Cert)" },
  { value: 6, label: "NQF Level 6 (Diploma)" },
  { value: 7, label: "NQF Level 7 (Bachelor's)" },
  { value: 8, label: "NQF Level 8 (Honours)" },
];

export function EducationSection({ formData, setFormData }) {
  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm">
      <header className="mb-10">
        <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Educational History</h3>
        <p className="text-gray-400 text-sm">Map your academic journey through the NQF framework.</p>
      </header>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current NQF Level</label>
        <select
          value={formData.nqf_level}
          onChange={(e) => setFormData((prev) => ({ ...prev, nqf_level: Number(e.target.value) }))}
          className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
        >
          <option value="">Select Level</option>
          {NQF_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>
    </section>
  );
}