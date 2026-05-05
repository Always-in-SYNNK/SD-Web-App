import { useState } from "react";
import { useLocation } from "react-router-dom";

import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";

import { StatsGrid } from "../components/admin/StatsGrid";
import { OpportunitiesTable } from "../components/admin/OpportunitiesTable";

import AdminTopbar from "../components/layout/AdminTopbar";

const TABS = [
  { label: "Approved", value: "approved" },
  { label: "Pending Review", value: "pending" },
];

export default function AdminConsole() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("pending");

  const source = location.state?.source || "applicant";
  const SidebarComponent =
    source === "provider" ? EmployerSidebar : ApplicantSidebar;

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full">
        {/* Top bar */}
        <AdminTopbar title="Admin Console" source={source} />

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

          <div className="bg-[#f5f3f3] rounded-xl px-8 pb-8 pt-4">
            <div className="flex justify-between items-center mb-6">
              {/* Tabs */}
              <div className="flex gap-1 bg-white border border-gray-200 rounded-lg p-1">
                {TABS.map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveTab(tab.value)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.value
                        ? "bg-[#035b9d] text-white"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <OpportunitiesTable mode={activeTab} />
          </div>
        </div>
      </main>
    </div>
  );
}