// src/components/forms/OpportunityForm.jsx
import { useEffect, useState } from "react";
import { publishOpportunity, saveDraft } from "../../services/opportunityService";
import { getFields } from "../../lib/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  location: "",
  requirements: "",
  stipend: "",
  nqf_level: "",
  duration: "",
  closing_date: "",
  field: "",
};

// Reusable labelled input wrapper
const Field = ({ label, hint, children }) => (
  <label className="block w-full group">
    <span className="font-label text-xs font-medium tracking-widest uppercase text-[#404850] group-focus-within:text-[#035b9d] transition-colors block mb-2">
      {label}
    </span>
    {children}
    {hint && (
      <p className="text-xs text-[#707881] mt-1.5 text-right">{hint}</p>
    )}
  </label>
);

const inputCls =
  "w-full bg-[#e3e2e2] border-none rounded-lg px-4 py-3.5 text-[#1b1c1c] font-body text-sm placeholder:text-[#707881] focus:outline-none focus:bg-[#d2e4ff] focus:ring-1 focus:ring-[#035b9d]/20 transition-all duration-200";

// Card section with left accent bar
const Section = ({ title, children }) => (
  <section className="relative bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(27,28,28,0.06)] px-10 py-10 border-0 overflow-hidden">
    <span className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-[#9f6400]" />
    <h3 className="font-headline text-2xl font-semibold text-on-surface mb-8 mb-4">
      {title}
    </h3>
    {children}
  </section>
);

const OpportunityForm = () => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldOptions, setFieldOptions] = useState([]);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  useEffect(() => {
    const loadFieldOptions = async () => {
      try {
        const result = await getFields();
        setFieldOptions(result?.data || []);
      } catch (err) {
        console.error("Error fetching field options:", err);
        setFieldOptions([]);
      }
    };

    loadFieldOptions();
  }, []);

  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Opportunity title is required.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    const { error } = await publishOpportunity(form);
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setForm(EMPTY_FORM);
    }
  };

  const handleDraft = async () => {
    setStatus("loading");
    setErrorMsg("");
    const { error } = await saveDraft(form);
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("draft-saved");
    }
  };

  return (
    <div className="max-w-4xl">
      {/* Page header */}
      <header className="mb-12">
        <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">
          Architect a New Opportunity
        </h2>
        <p className="text-[#404850] text-base max-w-xl leading-relaxed">
          Craft a compelling narrative for your learnership or internship. Clear,
          aspirational listings attract the most resilient candidates.
        </p>
      </header>

      <form className="flex flex-col gap-10" onSubmit={handlePublish} noValidate>
        {/* ── General Information ── */}
        <Section title="General Information">
          <div className="flex flex-col gap-7">
            <Field label="Opportunity Title">
              <input
                className={inputCls}
                type="text"
                placeholder="e.g., Software Engineering Learnership 2025"
                value={form.title}
                onChange={set("title")}
                required
              />
            </Field>

            <Field
              label="Narrative Description"
            >
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                placeholder="Describe the role, the environment, and the ultimate growth objective for the candidate..."
                value={form.description}
                onChange={set("description")}
              />
            </Field>

            <Field label="Workplace Location">
              <input
                className={inputCls}
                type="text"
                placeholder="e.g., Hybrid (Cape Town Base)"
                value={form.location}
                onChange={set("location")}
              />
            </Field>

            <Field label="Field / Sector">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none`}
                  value={form.field}
                  onChange={set("field")}
                >
                  <option value="">Select field...</option>
                  {fieldOptions.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#707881] pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </Field>
          </div>
        </Section>

        {/* ── Candidate Requirements ── */}
        <Section title="Candidate Requirements">
          <Field label="Essential Qualifications & Traits">
            <textarea
              className={`${inputCls} resize-none`}
              rows={6}
              placeholder="List the necessary technical skills, educational background, and behavioural traits expected..."
              value={form.requirements}
              onChange={set("requirements")}
            />
          </Field>
        </Section>

        {/* ── Program Logistics ── */}
        <Section title="Program Logistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            <Field label="Monthly Stipend (ZAR)">
              <input
                className={inputCls}
                type="number"
                min={0}
                placeholder="e.g., 5000"
                value={form.stipend}
                onChange={set("stipend")}
              />
            </Field>

            <Field label="Required NQF Level">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none`}
                  value={form.nqf_level}
                  onChange={set("nqf_level")}
                >
                  <option value="">Select NQF level…</option>
                  <option value="4">NQF Level 4 (Matric)</option>
                  <option value="5">NQF Level 5 (Higher Certificate)</option>
                  <option value="6">NQF Level 6 (Diploma / Advanced Certificate)</option>
                  <option value="7">NQF Level 7 (Bachelor's Degree / Advanced Diploma)</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#707881] pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </Field>

            <Field label="Program Duration">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none`}
                  value={form.duration}
                  onChange={set("duration")}
                >
                  <option value="">Select duration…</option>
                  <option value="1 Month">1 Month</option>
                  <option value="3 Months">3 Months</option>
                  <option value="6 Months">6 Months</option>
                  <option value="12 Months">12 Months</option>
                  <option value="18 Months">18 Months</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#707881] pointer-events-none text-lg">
                  expand_more
                </span>
              </div>
            </Field>

            <Field label="Closing Date">
              <input
                className={inputCls}
                type="date"
                value={form.closing_date}
                onChange={set("closing_date")}
              />
            </Field>
          </div>
        </Section>

        {/* ── Feedback banners ── */}
        {status === "error" && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-5 py-3.5 text-sm font-medium">
            ⚠ {errorMsg || "Something went wrong. Please try again."}
          </div>
        )}
        {status === "success" && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-5 py-3.5 text-sm font-medium">
            ✓ Opportunity published successfully and is pending review.
          </div>
        )}
        {status === "draft-saved" && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-5 py-3.5 text-sm font-medium">
            ✓ Draft saved.
          </div>
        )}

        {/* ── Actions ── */}
        <footer className="flex items-center justify-end gap-5 pt-4">
          <button
            type="button"
            onClick={handleDraft}
            disabled={status === "loading"}
            className="text-[#404850] font-headline font-semibold tracking-tight px-6 py-3 rounded-full hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
          >
            Save as Draft
          </button>

          <button
            type="submit"
            disabled={status === "loading"}
            className="bg-gradient-to-br from-[#035b9d] to-[#3174b7] text-white font-headline font-semibold tracking-tight px-10 py-3.5 rounded-full shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-transform duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "loading" ? "Publishing…" : "Publish Opportunity"}
          </button>
        </footer>
      </form>
    </div>
  );
};

export default OpportunityForm;
