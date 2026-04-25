import { useLocation } from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";

import { StatsGrid } from "../components/admin/StatsGrid";
import { OpportunitiesTable } from "../components/admin/OpportunitiesTable";

export default function AdminConsole() {
  const location = useLocation();

  // default = applicant if nothing passed
  const source = location.state?.source || "applicant";

  const SidebarComponent =
    source === "provider" ? EmployerSidebar : ApplicantSidebar;

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-12 h-16 bg-white border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">
            Admin Console
          </h1>

          <div className="flex gap-3 items-center">
            <input
              placeholder="Search live opportunities..."
              className="bg-gray-100 px-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-64"
            />
            <button className="p-2 hover:bg-gray-100 rounded-full">🔔</button>
            <button className="p-2 hover:bg-gray-100 rounded-full">⚙️</button>
          </div>
        </header>

        <div className="p-12">
          <header className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              Admin Panel
            </span>

            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Manage Opportunities
            </h2>

            <p className="text-gray-500 mt-2">
              Review, flag, and manage all live opportunities on the platform.
            </p>
          </header>

          <StatsGrid />

          <div className="bg-[#f5f3f3] rounded-xl p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">All Opportunities</h3>

              <div className="flex gap-2">
                <select className="bg-white border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none">
                  <option>All Status</option>
                  <option>Live</option>
                  <option>Flagged</option>
                  <option>Pending</option>
                </select>

                <select className="bg-white border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none">
                  <option>All Types</option>
                  <option>Learnership</option>
                  <option>Internship</option>
                  <option>Apprenticeship</option>
                </select>
              </div>
            </div>

            <OpportunitiesTable />
          </div>
        </div>
      </main>
    </div>
  );
}