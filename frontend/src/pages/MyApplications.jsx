
import { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Sidebar } from "../components/dashboard/Sidebar";
import { ApplicationList } from "../components/applications/myApplicationList";
import { NotificationDropdown } from "../components/notifications/notificationDropdown";
import { useNavigate } from "react-router-dom";
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

// Status categories for tabs
const STATUS_CATEGORIES = {
  ongoing: ["received", "shortlisted", "offered"],
  accepted: ["accepted"],
  rejected: ["rejected"]
};

// Status colors for charts and stats
const STATUS_COLORS = {
  received: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: "📝" },
  shortlisted: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: "⭐" },
  offered: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: "🎯" },
  accepted: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200", icon: "✅" },
  rejected: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", icon: "❌" }
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
    opportunityId: opportunity?.id,
    title: opportunity?.title ?? "Untitled opportunity",
    company: provider?.organisation_name ?? "",
    location: opportunity?.location ?? "Location TBD",
    status,
    rawStatus: statusKey,
    meta,
    closingDate: opportunity?.closing_date,
    created_at: application?.created_at,
  };
}

// Statistics Card Component
function StatsCard({ title, value, icon, color }) {
  return (
    <article className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition-all duration-300`}>
      <section className="flex items-center justify-between">
        <section>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-extrabold mt-1">{value}</p>
        </section>
        <i className="material-symbols-outlined text-4xl text-gray-300">{icon}</i>
      </section>
    </article>
  );
}

// Progress Bar Component
function ProgressBar({ percentage, color }) {
  return (
    <section className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <section 
        className={`h-2 rounded-full transition-all duration-700 ease-out ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </section>
  );
}

// Status Distribution Component
function StatusDistribution({ applications }) {
  const distribution = applications.reduce((acc, app) => {
    const status = app.rawStatus;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const total = applications.length;
  const statusOrder = ["received", "shortlisted", "offered", "accepted", "rejected"];

  if (total === 0) return null;

  return (
    <article className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="material-symbols-outlined text-[#035b9d]">analytics</i>
        Application Status Distribution
      </h3>
      <section className="space-y-3">
        {statusOrder.map(status => {
          const count = distribution[status] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          const color = STATUS_COLORS[status] || STATUS_COLORS.received;
          
          return (
            <section key={status}>
              <section className="flex justify-between text-sm mb-1">
                <section className="flex items-center gap-2">
                  <p className="text-lg">{color.icon}</p>
                  <p className="capitalize font-medium">{status}</p>
                </section>
                <section>
                  <strong className="font-bold text-gray-700">{count}</strong>
                  <small className="text-gray-400 text-xs ml-1">({percentage.toFixed(0)}%)</small>
                </section>
              </section>
              <ProgressBar percentage={percentage} color={status === "accepted" ? "bg-green-500" : status === "rejected" ? "bg-red-500" : status === "shortlisted" ? "bg-yellow-500" : "bg-[#035b9d]"} />
            </section>
          );
        })}
      </section>
    </article>
  );
}

// Timeline Component
function ApplicationTimeline({ applications }) {
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (recentApplications.length === 0) return null;

  return (
    <article className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i className="material-symbols-outlined text-[#035b9d]">schedule</i>
        Recent Activity
      </h3>
      <section className="space-y-4">
        {recentApplications.map((app, idx) => {
          const color = STATUS_COLORS[app.rawStatus] || STATUS_COLORS.received;
          return (
            <section key={app.id} className="flex items-center gap-4">
              <section className="relative">
                <section className="w-3 h-3 rounded-full" style={{ backgroundColor: app.rawStatus === "accepted" ? "#22c55e" : app.rawStatus === "rejected" ? "#ef4444" : "#035b9d" }} />
                {idx !== recentApplications.length - 1 && <section className="absolute top-3 left-1 w-0.5 h-8 bg-gray-200" />}
              </section>
              <section className="flex-1">
                <p className="font-medium text-gray-800 text-sm">{app.title}</p>
                <p className="text-xs text-gray-400">{app.meta}</p>
              </section>
              <p className={`px-2 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text}`}>
                {app.status}
              </p>
            </section>
          );
        })}
      </section>
    </article>
  );
}

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [animation, setAnimation] = useState(false);

  const { token, user } = useAuth();
  const API = import.meta.env.VITE_API_URL;
  const [profile, setProfile] = useState(null);

  // ✅ FIXED: Added API to dependency array
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API}/api/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    };
    if (token) fetchProfile();
  }, [token, API]);

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "JD";

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setAnimation(false);
      try {
        const data = await fetchMyApplications();
        const mapped = Array.isArray(data) ? data.map(mapApplicationToCard) : [];
        setApplications(mapped);
        setTimeout(() => setAnimation(true), 100);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUnapply = async (id) => {
    try {
      await unapplyFromApplication(id);
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert("Failed to withdraw application. Please try again.");
    }
  };

  const handleAccept = async (id) => {
    try {
      await acceptOffer(id);
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Accepted", rawStatus: "accepted" } : a))
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to accept offer");
    }
  };

  const getFilteredApplications = () => {
    const allowedStatuses = STATUS_CATEGORIES[activeTab];
    if (!allowedStatuses) return applications;
    return applications.filter(app => allowedStatuses.includes(app.rawStatus));
  };

  const getTabCount = (tabId) => {
    const statuses = STATUS_CATEGORIES[tabId];
    if (!statuses) return 0;
    return applications.filter(app => statuses.includes(app.rawStatus)).length;
  };

  const getStats = () => ({
    total: applications.length,
    ongoing: getTabCount("ongoing"),
    accepted: getTabCount("accepted"),
    rejected: getTabCount("rejected"),
    successRate: applications.length > 0 
      ? Math.round((getTabCount("accepted") / applications.length) * 100) 
      : 0
  });

  const filteredApplications = getFilteredApplications();
  const hasApplications = filteredApplications.length > 0;
  const stats = getStats();

  if (loading) {
    return (
      <main className="flex min-h-screen bg-[#faf9f8]">
        <Sidebar activePage="/applications" />
        <section className="ml-64 min-h-screen w-full flex items-center justify-center">
          <section className="text-center">
            <section className="w-12 h-12 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading your applications...</p>
          </section>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-[#faf9f8]">
      <Sidebar activePage="/applications" />

      <section className="ml-64 min-h-screen w-full">
        {/* Top Nav Bar */}
        <nav className="sticky top-0 z-50 flex items-center justify-between px-12 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <section className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="text-gray-400 hover:text-[#035b9d] transition-colors">Home</a>
            <a href="/dashboard" className="text-gray-400 hover:text-[#035b9d] transition-colors">Dashboard</a>
            <a href="/applications" className="text-[#035b9d] font-bold border-b-2 border-[#035b9d] pb-0.5">
              Applications
            </a>
          </section>

          <section className="flex items-center gap-4">
            <NotificationDropdown />
            <section className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <figure className="w-8 h-8 rounded-full bg-gradient-to-br from-[#035b9d] to-[#024a82] flex items-center justify-center text-white font-bold text-xs shadow-md">
                {initials}
              </figure>
              <p className="text-sm font-medium text-gray-700 hidden md:block">{profile?.full_name?.split(" ")[0] || "User"}</p>
            </section>
          </section>
        </nav>

        {/* Page Body */}
        <section className="p-8">
          {/* Welcome Banner */}
          <header className="mb-8 bg-gradient-to-r from-[#035b9d] to-[#024a82] rounded-2xl p-8 text-white shadow-lg">
            <section className="flex justify-between items-start">
              <section>
                <small className="text-sm font-semibold tracking-wider text-blue-200 uppercase">
                  Your Progress Dashboard
                </small>
                <h1 className="text-4xl md:text-5xl font-extrabold mt-2 tracking-tight">
                  My Applications
                </h1>
                <p className="text-blue-100 mt-2 max-w-2xl">
                  Track your journey toward professional excellence. View and manage your submissions across all opportunities.
                </p>
              </section>
              {stats.total > 0 && (
                <section className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[120px]">
                  <p className="text-3xl font-bold">{stats.successRate}%</p>
                  <p className="text-xs text-blue-200">Success Rate</p>
                </section>
              )}
            </section>
          </header>

          {/* Stats Cards Row */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatsCard title="Total Applications" value={stats.total} icon="assignment" color="border-blue-500" />
            <StatsCard title="Ongoing" value={stats.ongoing} icon="hourglass_empty" color="border-yellow-500" />
            <StatsCard title="Accepted" value={stats.accepted} icon="check_circle" color="border-green-500" />
            <StatsCard title="Rejected" value={stats.rejected} icon="cancel" color="border-red-500" />
          </section>

          {/* Two Column Layout */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Applications List */}
            <section className="lg:col-span-2 space-y-6">
              {/* Enhanced Tabs */}
              <nav className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                <button
                  onClick={() => setActiveTab("ongoing")}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === "ongoing"
                      ? "bg-[#035b9d] text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Ongoing
                  <small className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "ongoing"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {getTabCount("ongoing")}
                  </small>
                </button>
                <button
                  onClick={() => setActiveTab("accepted")}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === "accepted"
                      ? "bg-[#035b9d] text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Accepted
                  <small className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "accepted"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {getTabCount("accepted")}
                  </small>
                </button>
                <button
                  onClick={() => setActiveTab("rejected")}
                  className={`flex-1 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === "rejected"
                      ? "bg-[#035b9d] text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Rejected
                  <small className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeTab === "rejected"
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {getTabCount("rejected")}
                  </small>
                </button>
              </nav>

              {error && (
                <section className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </section>
              )}

              {!hasApplications ? (
                <section className={`text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-500 ${animation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <i className="material-symbols-outlined text-6xl text-gray-300 mb-4">inbox</i>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No applications yet</h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {activeTab === "ongoing" 
                      ? "You haven't submitted any applications yet. Start your journey by browsing opportunities." 
                      : activeTab === "accepted"
                      ? "You don't have any accepted applications yet. Keep applying!"
                      : "You don't have any rejected applications yet. Keep up the good work!"}
                  </p>
                  {activeTab === "ongoing" && (
                    <a
                      href="/opportunities"
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#035b9d] text-white rounded-xl font-semibold hover:bg-[#024a82] transition-all hover:shadow-md"
                    >
                      Browse Opportunities
                      <i className="material-symbols-outlined text-sm">arrow_forward</i>
                    </a>
                  )}
                </section>
              ) : (
                <section className={`transition-all duration-500 ${animation ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                  <ApplicationList
                    applications={filteredApplications}
                    loading={false}
                    error={null}
                    onUnapply={handleUnapply}
                    onAccept={handleAccept}
                  />
                </section>
              )}
            </section>

            {/* Right Column - Analytics Sidebar */}
            <aside className="lg:col-span-1 space-y-6">
              <StatusDistribution applications={applications} />
              <ApplicationTimeline applications={applications} />
              
              {/* Tip Card */}
              <article className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
                <section className="flex items-center gap-3 mb-3">
                  <i className="material-symbols-outlined text-amber-600 text-2xl">lightbulb</i>
                  <h3 className="font-bold text-amber-800">Pro Tip</h3>
                </section>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Did you know? Applicants who apply within the first week of an opportunity being posted are 40% more likely to be shortlisted.
                </p>
              </article>
            </aside>
          </section>
        </section>
      </section>
    </main>
  );
}
