// src/components/forms/OpportunityForm.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  publishOpportunity,
  updateOpportunity,
  saveDraft,
  getOpportunityById,
  getOpportunitySkills,
  saveOpportunitySkills,
  getSkillsByField,
} from "../../services/opportunityService";

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

const LOCATION = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "North West",
  "Northern Cape",
  "Western Cape",
  "Remote/Other",
];

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

const Field = ({ label, hint, children }) => (
  <label className="block w-full group">
    <span className="font-label text-xs font-medium tracking-widest uppercase text-[#404850] group-focus-within:text-[#035b9d] transition-colors block mb-2">
      {label}
    </span>
    {children}
    {hint && <p className="text-xs text-[#707881] mt-1.5 text-right">{hint}</p>}
  </label>
);

const inputCls =
  "w-full bg-[#e3e2e2] border-none rounded-lg px-4 py-3.5 text-[#1b1c1c] font-body text-sm placeholder:text-[#707881] focus:outline-none focus:bg-[#d2e4ff] focus:ring-1 focus:ring-[#035b9d]/20 transition-all duration-200";

const Section = ({ title, children }) => (
  <section className="relative bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(27,28,28,0.06)] px-10 py-10 border-0 overflow-hidden">
    <span className="absolute left-0 top-0 bottom-0 w-1 rounded-r bg-[#035b9d]" />
    <h3 className="font-headline text-2xl font-semibold text-on-surface mb-8 mb-4">
      {title}
    </h3>
    {children}
  </section>
);

const OpportunityForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [prefillLoading, setPrefillLoading] = useState(isEditing);

  // ── Skills state ──────────────────────────────────────────────────────────
  const [selectedSkills, setSelectedSkills] = useState([]);   // skills the provider has tagged
  const [availableSkills, setAvailableSkills] = useState([]); // skills returned for the chosen field
  const [loadingSkills, setLoadingSkills] = useState(false);

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  // ── Prefill form + existing skills when editing ───────────────────────────
  useEffect(() => {
    if (!id) return;

    const fetchDraft = async () => {
      const { data, error } = await getOpportunityById(id);
      if (error) {
        setErrorMsg("Could not load opportunity.");
        setStatus("error");
      } else {
        setForm({
          title:        data.title        ?? "",
          description:  data.description  ?? "",
          location:     data.location     ?? "",
          stipend:      data.stipend      ?? "",
          nqf_level:    data.nqf_level    ?? "",
          duration:     data.duration     ?? "",
          closing_date: data.closing_date ?? "",
          field:        data.field        ?? "",
        });
      }
      setPrefillLoading(false);
    };

    // Fetch skills already attached to this opportunity
    const fetchExistingSkills = async () => {
      try {
        const { data, error } = await getOpportunitySkills(id);
        if (error) {
          console.error("Failed to fetch opportunity skills:", error);
          return;
        }
        if (data && data.length > 0) {
          // Normalize skill shape to always have `id` and `title`
          setSelectedSkills(
            data.map((s) => ({ id: s.id, title: s.title ?? s.name }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch opportunity skills:", err);
      }
    };

    fetchDraft();
    fetchExistingSkills();
  }, [id]);


  // ── Fetch skills whenever the selected field changes ──────────────────────
  useEffect(() => {
    if (!form.field) {
      setAvailableSkills([]);
      return;
    }
    const fetchSkills = async () => {
      setLoadingSkills(true);
      try {
        const { data, error } = await getSkillsByField(form.field);
        if (error) {
          console.error("Failed to fetch skills:", error);
          setAvailableSkills([]);
          return;
        }
        // Normalize skills returned by service to ensure consistent shape
        setAvailableSkills(
          (data || []).map((s) => ({ id: s.id, title: s.title ?? s.name }))
        );
      } catch (err) {
        console.error("Failed to fetch skills:", err);
      } finally {
        setLoadingSkills(false);
      }
    };
    fetchSkills();
  }, [form.field]);

  // ── Skill helpers ─────────────────────────────────────────────────────────
  const addSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.find((s) => s.id === skill.id) ? prev : [...prev, skill]
    );
  };

  const removeSkill = (skillId) => {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  // Save skills to an opportunity that already has an id
  const persistSkills = async (opportunityId) => {
    const { data, error } = await saveOpportunitySkills(
      opportunityId,
      selectedSkills.map((s) => s.id)
    );
    if (error) {
      throw error;
    }
    return data;
  };

  const buildOpportunityPayload = (status) => ({
    ...form,
    status,
    skillIds: selectedSkills.map((skill) => skill.id),
  });

  // ── Form actions ──────────────────────────────────────────────────────────
  const handlePublish = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setErrorMsg("Opportunity title is required.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    const { data, error } = isEditing
      ? await updateOpportunity(id, buildOpportunityPayload("pending"))
      : await publishOpportunity(form);

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    // Create flows still need a separate skills write because the initial
    // publish request may not have persisted the opportunity id yet.
    const opportunityId = id ?? data?.id;
    if (!isEditing && opportunityId) {
      try {
        await persistSkills(opportunityId);
      } catch (skillsErr) {
        setErrorMsg(skillsErr.message || "Failed to save opportunity skills");
        setStatus("error");
        return;
      }
    }

    setStatus("success");
    if (!isEditing) {
      setForm(EMPTY_FORM);
      setSelectedSkills([]);
    }
  };

  const handleDraft = async () => {
    setStatus("loading");
    setErrorMsg("");

    const { data, error } = isEditing
      ? await updateOpportunity(id, buildOpportunityPayload("draft"))
      : await saveDraft(form);

    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
      return;
    }

    const opportunityId = id ?? data?.id;
    if (!isEditing && opportunityId) {
      try {
        await persistSkills(opportunityId);
      } catch (skillsErr) {
        setErrorMsg(skillsErr.message || "Failed to save opportunity skills");
        setStatus("error");
        return;
      }
    }

    setStatus("draft-saved");
  };

  if (prefillLoading) {
    return (
      <div className="max-w-4xl flex items-center justify-center py-32">
        <p className="text-gray-400 text-sm">Loading draft…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <header className="mb-12">
        <h2 className="font-headline text-4xl font-bold tracking-tight text-on-surface mb-3">
          {isEditing ? "Edit Draft" : "Architect a New Opportunity"}
        </h2>
        <p className="text-[#404850] text-base max-w-xl leading-relaxed">
          {isEditing
            ? "Update your draft before submitting it for review."
            : "Craft a compelling narrative for your learnership or internship."}
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

            <Field label="Narrative Description">
              <textarea
                className={`${inputCls} resize-none`}
                rows={5}
                placeholder="Describe the role, the environment, and the ultimate growth objective for the candidate..."
                value={form.description}
                onChange={set("description")}
              />
            </Field>

            <Field label="Workplace Location">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none`}
                  value={form.location}
                  onChange={set("location")}
                >
                  <option value="">Select location...</option>
                  {LOCATION.map((item) => (
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

            {/* Field selection also drives the skills picker below */}
            <Field label="Field / Sector">
              <div className="relative">
                <select
                  className={`${inputCls} appearance-none`}
                  value={form.field}
                  onChange={set("field")}
                >
                  <option value="">Select field...</option>
                  {FIELDS.map((item) => (
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

        {/* ── Required Skills ── */}
        <Section title="Required Skills">
          <div className="flex flex-col gap-6">
            {/* Tagged skills */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#404850] block mb-3">
                Tagged Skills
              </span>
              <div className="flex flex-wrap gap-2 min-h-[40px]">
                {selectedSkills.length === 0 ? (
                  <p className="text-[#707881] text-sm">
                    No skills tagged yet.{" "}
                    {!form.field && "Select a field above to browse skills."}
                  </p>
                ) : (
                  selectedSkills.map((skill) => (
                    <span
                      key={skill.id}
                      className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm flex items-center gap-2"
                    >
                      {skill.title}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-blue-300 hover:text-blue-600 text-xs leading-none"
                        aria-label={`Remove ${skill.title}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Available skills — only shown once a field is chosen */}
            {form.field && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#404850] block mb-3">
                  Available in "{form.field}"
                </span>
                {loadingSkills ? (
                  <p className="text-[#707881] text-sm">Loading skills…</p>
                ) : availableSkills.length === 0 ? (
                  <p className="text-[#707881] text-sm">No skills found for this field.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map((skill) => {
                      const already = selectedSkills.find((s) => s.id === skill.id);
                      return (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => addSkill(skill)}
                          disabled={!!already}
                          className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            already
                              ? "bg-blue-50 text-[#035b9d] font-bold cursor-default"
                              : "bg-[#e3e2e2] text-[#404850] hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          {skill.title} {already ? "✓" : "+"}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
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