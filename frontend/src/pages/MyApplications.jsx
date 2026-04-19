import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/dashboard/Sidebar";
import { ApplicationList } from "../components/applications/myApplicationList";
import { RecommendedPanel } from "../components/applications/RecommendedPanel";
import {
  acceptOffer,
  fetchMyApplications,
  unapplyFromApplication,
} from "../services/myApplicationService";

const STATUS_LABELS = {
  received: "Received",
  applied: "Received",
  shortlisted: "Shortlisted",
  rejected: "Rejected",
  offered: "Offered",
  accepted: "Accepted",
};

function formatDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;

  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function mapApplicationToCard(application) {
  const opportunity = Array.isArray(application?.opportunities)
    ? application.opportunities[0]
    : application?.opportunities ?? {};

  const provider = Array.isArray(opportunity?.provider_profiles)
    ? opportunity.provider_profiles[0]
    : opportunity?.provider_profiles ?? {};

  const statusKey = String(application?.status ?? "").toLowerCase();
  const status = STATUS_LABELS[statusKey] ?? "Received";

  const submitted = formatDate(application?.created_at);
  const closes = formatDate(opportunity?.closing_date);

  const meta =
    status === "Offered" && closes
      ? `Offer closes ${closes}`
      : submitted
        ? `Submitted ${submitted}`
        : "Submitted recently";

  return {
    id: application?.id,
    title: opportunity?.title ?? "Untitled opportunity",
    company: provider?.organisation_name ?? "",
    location: opportunity?.location ?? "Location TBD",
    status,
    meta,
  };
}

const MOCK_RECOMMENDATIONS = [
  {
    id: 1,
    title: "Sustainable Housing Designer",
    company: "Cape Habitat Initiative",
    type: "Permanent",
    badge: "High Match",
  },
  {
    id: 2,
    title: "BIM Technical Assistant",
    company: "Skyline Construction",
    type: "Internship",
    badge: "New Opportunity",
  },
];
// ──────────────────────────────────────────────────────────────────────────────

export default function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchMyApplications();
        const mapped = Array.isArray(data) ? data.map(mapApplicationToCard) : [];
        setApplications(mapped);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const handleView = (id) => navigate(`/applications/${id}`);

  const handleUnapply = async (id) => {
    //const confirmed = window.confirm("Are you sure you want to withdraw this application?");
    //if (!confirmed) return;

    try {
      await unapplyFromApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const handleAccept = async (id) => {
    //const confirmed = window.confirm("Accept this offer? This action cannot be undone.");
    //if (!confirmed) return;

    try {
      await acceptOffer(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Accepted" } : a))
      );
      //window.location.reload();
    } catch (err) {
    alert(err.response?.data?.error || "Failed to accept offer");
    }
  };

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/applications" />

      <section className="ml-64 min-h-screen w-full">
        {/* Top nav bar — mirrors Opportunities.jsx */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d]">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d]">Dashboard</a>
            <a href="/applications" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">
              Applications
            </a>
          </section>

          <section className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">❓</button>
            <figure className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[#035b9d] font-bold text-xs">
              RA
            </figure>
          </section>
        </nav>

        {/* Page body */}
        <section className="p-12">
          <header className="mb-12">
            <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              Your Progress
            </small>
            <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">
              My Applications
            </h1>
            <p className="text-gray-500 mt-4 max-w-2xl text-lg leading-relaxed">
              Track your journey toward professional excellence. View and manage your active submissions.
            </p>
          </header>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Application list */}
            <section className="lg:col-span-8 space-y-6">
              <header className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Ongoing Submissions</h2>
                {!loading && !error && (
                  <span className="text-xs font-bold bg-[#e3e2e2] px-3 py-1 rounded-full text-gray-500 uppercase tracking-wide">
                    {applications.length} Total
                  </span>
                )}
              </header>

              <ApplicationList
                applications={applications}
                loading={loading}
                error={error}
                onView={handleView}
                onUnapply={handleUnapply}
                onAccept={handleAccept}
              />
            </section>

            {/* Recommendations sidebar */}
            <aside className="lg:col-span-4 space-y-8">
              <RecommendedPanel
                recommendations={MOCK_RECOMMENDATIONS}
                qualification="Architecture Degree"
                skillScore={92}
              />
            </aside>
          </section>
        </section>
      </section>
    </main>
  );
}
