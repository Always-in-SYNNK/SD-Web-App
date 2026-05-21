import { useState, useEffect } from "react";
import { useAuth } from "../../context/useAuth";

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

const STATUS_OPTIONS = [
  { value: "completed", label: "Completed" },
  { value: "in_progress", label: "In Progress" },
];

const EMPTY_FORM = {
  qualification_id: null,
  custom_name: "",
  custom_nqf_level: "",
  custom_field: "",
  custom_subfield: "",
  status: "completed",
  originator: "",
  date_obtained: "",
};

export function QualificationsSection() {
  const { token } = useAuth();
  const API = import.meta.env.VITE_API_URL;

  const [qualifications, setQualifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  // fetch existing qualifications
  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me/qualifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setQualifications(data.qualifications || []);
      } catch (err) {
        console.error("Failed to load qualifications:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch_();
  }, [token]);

  const handleAdd = async () => {
    if (!form.custom_name) {
      setError("Please enter a qualification name.");
      return;
    }
    if (!form.status) {
      setError("Please select a status.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/profile/me/qualifications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add qualification");
      }
      const data = await res.json();
      setQualifications((prev) => [...prev, data.qualification]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/api/profile/me/qualifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setQualifications((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error("Failed to delete qualification:", err);
    }
  };

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#035b9d]" />

      <header className="flex items-center justify-between mb-8">
        <section>
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-1">Qualifications</h3>
          <p className="text-gray-400 text-sm">Add your completed or in-progress qualifications.</p>
        </section>
        <button
          type="button"
          onClick={() => { setShowForm((prev) => !prev); setError(null); }}
          className="flex items-center gap-2 text-[#035b9d] font-bold text-sm hover:underline"
        >
          {showForm ? "✕ Cancel" : "+ Add Qualification"}
        </button>
      </header>

      {/* Add form */}
      {showForm && (
        <form
          className="bg-gray-50 rounded-xl p-6 mb-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <fieldset className="md:col-span-2 space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Qualification Name <strong className="text-red-400">*</strong>
              </legend>
              <input
                type="text"
                value={form.custom_name}
                onChange={set("custom_name")}
                placeholder="e.g. National Certificate in IT"
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              />
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">NQF Level</legend>
              <select
                value={form.custom_nqf_level}
                onChange={set("custom_nqf_level")}
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              >
                <option value="">Select NQF Level</option>
                {NQF_LEVELS.map((l) => (
                  <option key={l} value={l}>NQF Level {l}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Status <strong className="text-red-400">*</strong>
              </legend>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Field</legend>
              <select
                value={form.custom_field}
                onChange={set("custom_field")}
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              >
                <option value="">Select Field</option>
                {FIELDS.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Subfield</legend>
              <input
                type="text"
                value={form.custom_subfield}
                onChange={set("custom_subfield")}
                placeholder="e.g. Software Development"
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              />
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Institution / Originator</legend>
              <input
                type="text"
                value={form.originator}
                onChange={set("originator")}
                placeholder="e.g. University of Johannesburg"
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              />
            </fieldset>

            <fieldset className="space-y-1">
              <legend className="text-xs font-semibold uppercase tracking-wider text-gray-400">Date Obtained</legend>
              <input
                type="date"
                value={form.date_obtained}
                onChange={set("date_obtained")}
                className="w-full bg-white border-none rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] text-sm"
              />
            </fieldset>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <footer className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Add Qualification"}
            </button>
          </footer>
        </form>
      )}

      {/* Existing qualifications */}
      {loading ? (
        <p className="text-gray-400 text-sm">Loading qualifications...</p>
      ) : qualifications.length === 0 ? (
        <p className="text-gray-400 text-sm">No qualifications added yet.</p>
      ) : (
        <ul className="space-y-3">
          {qualifications.map((q) => (
            <li key={q.id}>
              <article className="flex items-start justify-between p-4 bg-gray-50 rounded-xl group hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100">
                <section className="flex gap-4">
                  <figure className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-lg shrink-0" aria-hidden="true">
                    🎓
                  </figure>
                  <section>
                    <p className="font-bold text-[#1b1c1c] text-sm">{q.title || q.qualification_name}</p>
                    {q.field && <p className="text-xs text-gray-400 mt-0.5">{q.field}{q.subfield ? ` · ${q.subfield}` : ""}</p>}
                    {q.originator && <p className="text-xs text-gray-400">{q.originator}</p>}
                    <ul className="flex gap-2 mt-2 flex-wrap" aria-label="qualification metadata">
                      {q.nqf_level && (
                        <li>
                          <strong className="text-xs bg-blue-50 text-[#035b9d] px-2 py-0.5 rounded-full font-semibold">
                            NQF {q.nqf_level}
                          </strong>
                        </li>
                      )}
                      <li>
                        <strong className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          q.status === "completed"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}>
                          {q.status === "completed" ? "Completed" : "In Progress"}
                        </strong>
                      </li>
                      {q.date_obtained && (
                        <li>
                          <time className="text-xs text-gray-300" dateTime={q.date_obtained}>
                            {q.date_obtained}
                          </time>
                        </li>
                      )}
                    </ul>
                  </section>
                </section>
                <button
                  type="button"
                  onClick={() => handleDelete(q.id)}
                  className="text-gray-200 hover:text-red-400 transition text-lg opacity-0 group-hover:opacity-100"
                  aria-label="Delete qualification"
                >
                  🗑
                </button>
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}