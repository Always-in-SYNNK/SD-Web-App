import { useState } from "react";

const NQF_LEVELS = [
  "NQF Level 4 (Matric)",
  "NQF Level 5 (Higher Cert)",
  "NQF Level 6 (Diploma)",
  "NQF Level 7 (Bachelor's)",
  "NQF Level 8 (Honours)",
];

export function EducationSection() {
  const [entries, setEntries] = useState([
    { id: 1, institution: "University of Cape Town", qualification: "BSc in Computer Science", nqf: "NQF Level 7" },
  ]);

  const removeEntry = (id) => setEntries((prev) => prev.filter((e) => e.id !== id));

  const addEntry = () =>
    setEntries((prev) => [...prev, { id: Date.now(), institution: "", qualification: "", nqf: "" }]);

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-2">Educational History</h3>
          <p className="text-gray-400 text-sm">Map your academic journey through the NQF framework.</p>
        </div>
        <button onClick={addEntry} className="flex items-center gap-2 text-[#035b9d] font-bold text-sm hover:underline">
          + Add Education
        </button>
      </div>

      <div className="space-y-4 mb-6">
        {entries.map((entry) => (
          <div key={entry.id} className="p-6 bg-gray-50 rounded-xl flex flex-col md:flex-row justify-between gap-4 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center shadow-sm text-xl">🎓</div>
              <div>
                <h4 className="font-bold text-[#1b1c1c]">{entry.institution || "New Institution"}</h4>
                <p className="text-sm text-gray-400">{entry.qualification || "Qualification"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {entry.nqf && (
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-tight">
                  {entry.nqf}
                </span>
              )}
              <button onClick={() => removeEntry(entry.id)} className="text-gray-300 hover:text-red-400 transition-colors text-lg">
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current NQF Level</label>
          <select className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]">
            <option>Select Level</option>
            {NQF_LEVELS.map((l) => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Graduation Year</label>
          <input
            type="number"
            placeholder="year of graduation"
            className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
          />
        </div>
      </div>
    </section>
  );
}