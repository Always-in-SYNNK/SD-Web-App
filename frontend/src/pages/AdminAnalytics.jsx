import { useEffect, useState, useCallback } from "react";
import { useLocation }                       from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar                 from "../components/layout/Sidebar";
import AdminTopbar                     from "../components/layout/AdminTopbar";
import { useAuth }                     from "../context/useAuth";

import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";
import { getApplicationVolume }  from "../services/analyticsService";

export default function AdminAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  // ── mirrors the exact same source-detection pattern as AdminAccessApplications ──
  const source           = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getApplicationVolume();
      setData(result.data);
    } catch (err) {
      console.error("[AdminAnalytics]", err.message);
      setError("Could not load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
        <p className="text-gray-400">Loading analytics…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">

      {/* Renders ApplicantSidebar or EmployerSidebar depending on which
          portal navigated here — no mixing of page logic, just sidebar swap */}
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">

        {/* AdminTopbar already handles both source values internally */}
        <AdminTopbar title="Analytics" source={source} />

        <div className="p-12">

          {/* ── page intro ── */}
          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              System Control Room
            </span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Analytics &amp; Governance
            </h2>
            <p className="text-gray-500 mt-2">
              Application volume per opportunity across all listings.
            </p>
          </div>

          {/* ── error banner ── */}
          {error && (
            <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">
              {error}
            </div>
          )}

          {/* ── table ── */}
          <OpportunityBreakdownTable data={data} />

        </div>
      </main>
    </div>
  );
}