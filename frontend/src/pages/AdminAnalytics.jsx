import { useEffect, useState, useCallback } from "react";
import { useLocation }                       from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar                 from "../components/layout/Sidebar";
import AdminTopbar                     from "../components/layout/AdminTopbar";
import { useAuth }                     from "../context/useAuth";

import SectorBarChart            from "../components/analytics/SectorBarChart";
import SectorPieChart            from "../components/analytics/SectorPieChart";
import OpportunityBreakdownTable from "../components/analytics/OpportunityBreakdownTable";

import { getPlacementRates, getApplicationVolume } from "../services/analyticsService";

const MOCK_SECTORS = [
  { sector: "Human and Social Studies",                             total_applications: 45,  accepted_applications: 8,  placement_rate: 17.8 },
  { sector: "Physical, Mathematical, Computer and Life Sciences",   total_applications: 89,  accepted_applications: 21, placement_rate: 23.6 },
  { sector: "Law, Military Science and Security",                   total_applications: 32,  accepted_applications: 4,  placement_rate: 12.5 },
  { sector: "Culture and Arts",                                     total_applications: 27,  accepted_applications: 5,  placement_rate: 18.5 },
  { sector: "Manufacturing, Engineering and Technology",            total_applications: 74,  accepted_applications: 14, placement_rate: 18.9 },
  { sector: "Services",                                             total_applications: 61,  accepted_applications: 11, placement_rate: 18.0 },
  { sector: "Health Sciences and Social Services",                  total_applications: 53,  accepted_applications: 9,  placement_rate: 17.0 },
  { sector: "Business, Commerce and Management Studies",            total_applications: 98,  accepted_applications: 19, placement_rate: 19.4 },
  { sector: "Physical Planning and Construction",                   total_applications: 41,  accepted_applications: 7,  placement_rate: 17.1 },
  { sector: "Agriculture and Nature Conservation",                  total_applications: 29,  accepted_applications: 3,  placement_rate: 10.3 },
  { sector: "Education, Training and Development",                  total_applications: 38,  accepted_applications: 6,  placement_rate: 15.8 },
  { sector: "Communication Studies and Language",                   total_applications: 22,  accepted_applications: 4,  placement_rate: 18.2 },
];

const MOCK_TABLE = [
  { opportunityTitle: "Architecture Internship",        count: 68, status: "approved", location: "Johannesburg, ZA", opportunityId: "mock-1", statusBreakdown: { pending: 20, shortlisted: 30, accepted: 10, rejected: 8 } },
  { opportunityTitle: "Urban Design Grad Programme",    count: 54, status: "approved", location: "Cape Town, ZA",    opportunityId: "mock-2", statusBreakdown: { pending: 15, shortlisted: 22, accepted: 12, rejected: 5 } },
  { opportunityTitle: "Heritage Restoration Placement", count: 41, status: "approved", location: "Pretoria, ZA",     opportunityId: "mock-3", statusBreakdown: { pending: 10, shortlisted: 18, accepted: 8,  rejected: 5 } },
  { opportunityTitle: "Structural Engineering Bursary", count: 37, status: "pending",  location: "Durban, ZA",       opportunityId: "mock-4", statusBreakdown: { pending: 37, shortlisted: 0,  accepted: 0,  rejected: 0 } },
  { opportunityTitle: "Landscape Design Learnership",   count: 28, status: "approved", location: "Johannesburg, ZA", opportunityId: "mock-5", statusBreakdown: { pending: 8,  shortlisted: 12, accepted: 5,  rejected: 3 } },
];

const MOCK_TOTALS = { totalApplications: 247, activeOpportunities: 4, averagePerOpportunity: 41 };

function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

export default function AdminAnalytics() {
  const location = useLocation();
  const { user } = useAuth();

  const source           = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;

  const [sectorData, setSectorData] = useState(MOCK_SECTORS);
  const [tableData,  setTableData]  = useState(MOCK_TABLE);
  const [totals,     setTotals]     = useState(MOCK_TOTALS);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [placementResult, appResult] = await Promise.allSettled([
        getPlacementRates(),
        getApplicationVolume(),
      ]);

      if (placementResult.status === "fulfilled") {
        setSectorData(placementResult.value.raw);
      } else {
        console.error("[AdminAnalytics] placements:", placementResult.reason?.message);
        setError("Could not load live data. Showing example data.");
      }

      if (appResult.status === "fulfilled") {
        setTableData(appResult.value.data);
        setTotals(appResult.value.totals);
      } else {
        console.error("[AdminAnalytics] apps:", appResult.reason?.message);
      }
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
      <SidebarComponent />
      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Analytics" source={source} />
        <div className="p-12">

          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">System Control Room</span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">Analytics &amp; Governance</h2>
            <p className="text-gray-500 mt-2">Application volume and acceptance rates per sector.</p>
          </div>

          {error && (
            <div className="mb-6 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-700">{error}</div>
          )}

          <section className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Total Applications"              value={totals.totalApplications}    color="text-gray-800"  />
            <StatCard label="Active Opportunities"            value={totals.activeOpportunities}   color="text-[#035b9d]" />
            <StatCard label="Avg. Applications / Opportunity" value={totals.averagePerOpportunity} color="text-green-600" />
          </section>

          <section className="flex flex-col gap-6 mb-6">
            <SectorBarChart data={sectorData} />
            <SectorPieChart data={sectorData} />
          </section>

          <section>
            <OpportunityBreakdownTable data={tableData} />
          </section>

        </div>
      </main>
    </div>
  );
}