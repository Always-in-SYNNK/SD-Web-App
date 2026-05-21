import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import { fetchProviderProfile } from "../services/providerProfileService";

const ORG_TYPE_COLORS = {
  "Training Organisation": "bg-blue-50 text-[#035b9d]",
  "TVET College":          "bg-purple-50 text-purple-700",
  "University":            "bg-indigo-50 text-indigo-700",
  "Private Company":       "bg-green-50 text-green-700",
  "NGO":                   "bg-amber-50 text-amber-700",
  "Government Department": "bg-gray-100 text-gray-700",
};

export default function ViewProviderProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchProviderProfile()
      .then(setProfile)
      .catch((err) => console.error("Failed to load provider profile:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const providerProfile = profile?.provider_profiles;
  const focusFields     = providerProfile?.focus_fields ?? [];
  const location    = providerProfile?.location;
  const websiteUrl  = providerProfile?.website_url;

  const orgTypeBadge =
    ORG_TYPE_COLORS[providerProfile?.organisation_type] ?? "bg-gray-100 text-gray-600";

  const COMPLETION_FIELDS = [
    { label: "Full name",          done: !!profile?.full_name },
    { label: "Organisation name",  done: !!providerProfile?.organisation_name },
    { label: "Organisation type",  done: !!providerProfile?.organisation_type },
    { label: "Province",           done: !!providerProfile?.location },
    { label: "Description",        done: !!providerProfile?.description },
    { label: "Website",            done: !!providerProfile?.website_url },
    { label: "Focus fields",       done: (providerProfile?.focus_fields?.length ?? 0) > 0 },
  ];
  const completedCount = COMPLETION_FIELDS.filter((f) => f.done).length;
  const percentage     = Math.round((completedCount / COMPLETION_FIELDS.length) * 100);

  return (
    <main className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <section className="ml-64 flex flex-col min-h-screen w-full min-w-0">
        <Topbar user={user} />

        <section className="pb-24 px-8 pt-12">
          <div className="max-w-4xl mx-auto">

            {/* Page header */}
            <header className="mb-12 flex items-start justify-between">
              <div>
                <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
                  Provider Profile
                </small>
                <h1 className="text-4xl lg:text-5xl font-extrabold text-[#1b1c1c] tracking-tight mb-3 mt-1">
                  {loading
                    ? "Loading..."
                    : providerProfile?.organisation_name || profile?.full_name || "Your Profile"}
                </h1>
                {providerProfile?.organisation_type && (
                  <strong className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${orgTypeBadge}`}>
                    {providerProfile.organisation_type}
                  </strong>
                )}
              </div>
              <button
                onClick={() => navigate("/provider/profile/edit")}
                className="px-6 py-3 bg-[#035b9d] text-white rounded-full font-bold text-sm hover:opacity-90 transition shrink-0 mt-2"
              >
                ✏️ Edit Profile
              </button>
            </header>

            {loading ? (
              <p className="text-gray-400 text-sm">Loading your profile...</p>
            ) : (
              

              <div className="space-y-6">

                <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1b1c1c]">Profile completion</span>
                  <span className={`text-sm font-bold ${percentage === 100 ? "text-green-600" : "text-[#035b9d]"}`}>
                    {percentage}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <i
                    aria-hidden="true"
                    className={`h-full rounded-full transition-all duration-500 ${
                      percentage === 100 ? "bg-green-500" : "bg-[#035b9d]"
                    }`}
                    style={{ width: `${percentage}%`, display: 'block' }}
                  />
                </div>
                {percentage < 100 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Missing: {COMPLETION_FIELDS.filter((f) => !f.done).map((f) => f.label).join(", ")}
                  </p>
                )}
              </div>

                {/* Personal Details */}
                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#3174b7]" />
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-6">Contact Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Full Name
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.full_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Email Address
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">{profile?.email || "—"}</dd>
                    </div>
                  </dl>
                </section>

                {/* Organisation Details */}
                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                  <h3 className="text-lg font-bold text-[#1b1c1c] mb-6">Organisation</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Organisation Name
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">
                        {providerProfile?.organisation_name || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Organisation Type
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">
                        {providerProfile?.organisation_type || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Website
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">
                        {websiteUrl
                          ? <a href={websiteUrl} target="_blank" rel="noreferrer" className="text-[#035b9d] hover:underline">{websiteUrl}</a>
                          : "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Province
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium">{location || "—"}</dd>
                    </div>
                    <div className="md:col-span-2">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">
                        Description
                      </dt>
                      <dd className="text-[#1b1c1c] font-medium leading-relaxed">
                        {providerProfile?.description || "No description added yet."}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Focus Fields */}
                <section className="bg-white p-8 rounded-xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#035b9d]" />
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-[#1b1c1c]">Focus Fields</h3>
                    <button
                      onClick={() => navigate("/provider/profile/edit")}
                      className="text-xs text-[#035b9d] font-semibold hover:underline"
                    >
                      + Edit
                    </button>
                  </div>
                  {focusFields.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No focus fields selected yet.{" "}
                      <button
                        onClick={() => navigate("/provider/profile/edit")}
                        className="text-[#035b9d] font-semibold hover:underline"
                      >
                        Add some →
                      </button>
                    </p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {focusFields.map((field) => (
                        <li key={field} className="list-none px-0">
                          <strong className="px-4 py-2 bg-blue-50 text-[#035b9d] font-bold rounded-full text-sm block">
                            {field}
                          </strong>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>

              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
