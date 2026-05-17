import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import {
  fetchProviderProfileByUserId,
  editProviderProfile,
} from "../../services/providerProfileService";

// Form when providers are editing their profile
const ORGANISATION_TYPES = [
  "Private Company",
  "Training Organisation",
  "TVET College",
  "University",
  "NGO",
  "Government Department",
  "Other",
];

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

export function EditProviderProfileForm() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(false);

  const [formData, setFormData] = useState({
    full_name:          "",
    organisation_name:  "",
    organisation_type:  "",
    description:        "",
    focus_fields:       [],
    location:           "",
    website_url:        "",
  });

  // Pre-fill form on mount
  useEffect(() => {
    if (!user) return;
    fetchProviderProfileByUserId(user.id)
      .then((profile) => {
        if (profile) {
          setFormData({
            full_name:         profile.full_name                          ?? "",
            organisation_name: profile.provider_profiles?.organisation_name ?? "",
            organisation_type: profile.provider_profiles?.organisation_type ?? "",
            description:       profile.provider_profiles?.description       ?? "",
            focus_fields:      profile.provider_profiles?.focus_fields      ?? [],
            location:          profile.provider_profiles?.location          ?? "",
            website_url:       profile.provider_profiles?.website_url       ?? "",
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        setError("Failed to load your profile. Please refresh.");
      })
      .finally(() => setLoading(false));
  }, [user]);

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const toggleField = (field) => {
    setFormData((prev) => {
      const current = prev.focus_fields ?? [];
      return {
        ...prev,
        focus_fields: current.includes(field)
          ? current.filter((f) => f !== field)
          : [...current, field],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      // Strip empty strings so we don't overwrite existing data with blanks
      const { focus_fields, ...scalars } = formData;
      const payload = {
        ...Object.fromEntries(Object.entries(scalars).filter(([, v]) => v !== "" && v !== null)),
        focus_fields,
      };
      await editProviderProfile(user.id, payload);
      setSuccess(true);
      setTimeout(() => navigate("/provider/profile"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const COMPLETION_FIELDS = [
    { key: "full_name",          label: "Full name",           check: (v) => !!v },
    { key: "organisation_name",  label: "Organisation name",   check: (v) => !!v },
    { key: "organisation_type",  label: "Organisation type",   check: (v) => !!v },
    { key: "location",           label: "Province",            check: (v) => !!v },
    { key: "description",        label: "Description",         check: (v) => !!v },
    { key: "website_url",        label: "Website",             check: (v) => !!v },
    { key: "focus_fields",       label: "Focus fields",        check: (v) => v?.length > 0 },
  ];
  const completed  = COMPLETION_FIELDS.filter(({ key, check }) => check(formData[key]));
  const percentage = Math.round((completed.length / COMPLETION_FIELDS.length) * 100);

  if (loading) return <p className="text-gray-400 text-sm p-12">Loading your profile...</p>;

  return (
    
    <div className="space-y-8">

      {/* Completion bar */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-[#1b1c1c]">Profile completion</span>
          <span className={`text-sm font-bold ${percentage === 100 ? "text-green-600" : "text-[#035b9d]"}`}>
            {percentage}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage === 100 ? "bg-green-500" : "bg-[#035b9d]"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {percentage < 100 && (
          <p className="text-xs text-gray-400 mt-2">
            Missing: {COMPLETION_FIELDS.filter(({ key, check }) => !check(formData[key])).map(f => f.label).join(", ")}
          </p>
        )}
      </div>

      {/* Contact Details */}
      <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-1">Contact Details</h3>
          <p className="text-gray-400 text-sm">Your name as it will appear to applicants.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Full Name
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={set("full_name")}
              placeholder="Jane Smith"
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
          {/* Email is read-only — managed by auth, not editable here */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Email Address
            </label>
            <input
              type="text"
              value={user?.email ?? ""}
              disabled
              className="w-full bg-gray-100 border-none rounded-lg p-4 text-gray-400 cursor-not-allowed"
            />
            <p className="text-xs text-gray-300">Email is managed by your account settings.</p>
          </div>
        </div>
      </section>

      {/* Organisation Details */}
      <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-1">Organisation</h3>
          <p className="text-gray-400 text-sm">Help applicants understand who you are and what you do.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Organisation Name
            </label>
            <input
              type="text"
              value={formData.organisation_name}
              onChange={set("organisation_name")}
              placeholder="Tech Corp"
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Organisation Type
            </label>
            <select
              value={formData.organisation_type}
              onChange={set("organisation_type")}
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            >
              <option value="">Select type...</option>
              {ORGANISATION_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Website URL
            </label>
            <input
              type="url"
              value={formData.website_url}
              onChange={set("website_url")}
              placeholder="https://yourorganisation.co.za"
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Province
            </label>
            <select
              value={formData.location}
              onChange={set("location")}
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c]"
            >
              <option value="">Select province...</option>
              {LOCATION.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Description
            </label>
            <textarea
              rows={5}
              value={formData.description}
              onChange={set("description")}
              placeholder="Tell applicants about your organisation, the kind of opportunities you offer, and what makes you a great place to learn..."
              className="w-full bg-gray-50 border-none rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-200 text-[#1b1c1c] resize-none"
            />
          </div>
        </div>
      </section>
      
      {/* Focus Fields */}
      <section className="bg-white p-8 lg:p-12 rounded-xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-[#035b9d]" />
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#1b1c1c] mb-1">Focus Fields</h3>
          <p className="text-gray-400 text-sm">
            Select the SAQA/NQF-aligned fields your opportunities fall under.
            {formData.focus_fields.length > 0 && (
              <span className="ml-2 text-[#035b9d] font-semibold">
                {formData.focus_fields.length} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {FIELDS.map((field) => {
            const selected = formData.focus_fields.includes(field);
            return (
              <button
                key={field}
                type="button"
                onClick={() => toggleField(field)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  selected
                    ? "bg-[#035b9d] text-white border-[#035b9d] shadow-md shadow-blue-100"
                    : "bg-gray-50 text-gray-500 border-gray-200 hover:border-[#035b9d] hover:text-[#035b9d]"
                }`}
              >
                {selected && <span className="mr-1.5">✓</span>}
                {field}
              </button>
            );
          })}
        </div>
      </section>

      {/* Feedback */}
      {error   && <p className="text-red-500 text-sm text-center">{error}</p>}
      {success && <p className="text-green-500 text-sm text-center">Profile saved! Redirecting...</p>}

      {/* Actions */}
      <nav className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8">
        <button
          onClick={() => navigate("/provider/profile")}
          className="text-gray-400 font-bold hover:text-[#1b1c1c] transition-colors flex items-center gap-2"
        >
          ← Discard Changes
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-12 py-5 bg-gradient-to-br from-[#035b9d] to-[#3174b7] text-white rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </nav>
    </div>
  );
}
