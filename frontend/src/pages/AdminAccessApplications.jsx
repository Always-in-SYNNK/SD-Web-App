// src/pages/AdminAccessApplications.jsx
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";
import AdminTopbar from "../components/layout/AdminTopbar";
import { useAuth } from "../context/useAuth";
import {
  getAdminApplications,
  grantAdminAccess,
  rejectAdminApplication,
} from "../services/adminService";

// ─── stat card - no div/span ────────────────────────────────────────────────
function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ─── status badge - using p instead of span ─────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <p className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </p>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function AdminAccessApplications() {
  const location = useLocation();
  const { user } = useAuth();
  const source = location.state?.source || "applicant";
  const SidebarComponent = source === "provider" ? EmployerSidebar : ApplicantSidebar;
  const isAdmin = Boolean(user?.isAdmin);

  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState(null);

  // ── fetch all applications (pending + history) ────────────────────────────
  const fetchAll = useCallback(async () => {
    const allApplications = await getAdminApplications();
    const rows = Array.isArray(allApplications) ? allApplications : [];

    setPending(rows.filter((row) => row.status === "pending"));
    setHistory(rows.filter((row) => row.status === "approved" || row.status === "rejected"));
  }, []);

  // ✅ Proper pattern - define async function inside useEffect and call it
  useEffect(() => {
    const loadData = async () => {
      const allApplications = await getAdminApplications();
      const rows = Array.isArray(allApplications) ? allApplications : [];

      setPending(rows.filter((row) => row.status === "pending"));
      setHistory(rows.filter((row) => row.status === "approved" || row.status === "rejected"));
    };
    
    loadData();
  }, []); // Empty dependency array - only runs once on mount

  // ── grant / reject ────────────────────────────────────────────────────────
  const handleGrant = async (app) => {
    setActionLoading(app.id);
    await grantAdminAccess(app.id);
    
    // Refresh data after action
    const allApplications = await getAdminApplications();
    const rows = Array.isArray(allApplications) ? allApplications : [];
    setPending(rows.filter((row) => row.status === "pending"));
    setHistory(rows.filter((row) => row.status === "approved" || row.status === "rejected"));
    
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    await rejectAdminApplication(id);
    
    // Refresh data after action
    const allApplications = await getAdminApplications();
    const rows = Array.isArray(allApplications) ? allApplications : [];
    setPending(rows.filter((row) => row.status === "pending"));
    setHistory(rows.filter((row) => row.status === "approved" || row.status === "rejected"));
    
    setActionLoading(null);
  };

  // ── derived counts ────────────────────────────────────────────────────────
  const allRows = [...pending, ...history];
  const approved = history.filter(r => r.status === "approved");
  const rejected = history.filter(r => r.status === "rejected");

  const displayRows = filter === "all" ? allRows
    : filter === "pending" ? pending
    : history.filter(r => r.status === filter);

  return (
    <section className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full min-w-0">
        <AdminTopbar title="Admin Access Applications" source={source} />

        <section className="p-12">
          <header className="mb-8">
            <p className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              Admin Panel
            </p>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Manage Admin Applications
            </h2>
            <p className="text-gray-500 mt-2">
              Review who has requested admin access and manage their status.
            </p>
          </header>

          <section className="grid grid-cols-3 gap-4 mb-10">
            <StatCard label="Total Applications" value={allRows.length} color="text-gray-800" />
            <StatCard label="Pending Review" value={pending.length} color="text-yellow-600" />
            <StatCard label="Approved Admins" value={approved.length} color="text-green-600" />
          </section>

          <section className="bg-[#f5f3f3] rounded-xl p-8">
            <section className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">All Applications</h3>
              <section className="flex gap-2">
                {["all", "pending", "approved", "rejected"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize border transition ${
                      filter === f
                        ? "bg-[#035b9d] text-white border-[#035b9d]"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {f}
                    {f === "pending" && ` (${pending.length})`}
                    {f === "approved" && ` (${approved.length})`}
                    {f === "rejected" && ` (${rejected.length})`}
                  </button>
                ))}
              </section>
            </section>

            {displayRows.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">
                No applications found{filter !== "all" ? ` with status "${filter}"` : ""}.
              </p>
            ) : (
              <section className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-6 font-semibold">Name</th>
                      <th className="pb-3 pr-6 font-semibold">Email</th>
                      <th className="pb-3 pr-6 font-semibold">Role</th>
                      <th className="pb-3 pr-6 font-semibold">Applied</th>
                      <th className="pb-3 pr-6 font-semibold">Status</th>
                      {isAdmin && <th className="pb-3 font-semibold">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {displayRows.map((app) => (
                      <tr key={app.id} className="bg-white hover:bg-gray-50 transition">
                        <td className="py-4 pr-6 font-medium text-gray-800">
                          {app.profiles?.full_name || "—"}
                        </td>
                        <td className="py-4 pr-6 text-gray-500">
                          {app.profiles?.email || "—"}
                        </td>
                        <td className="py-4 pr-6 capitalize text-gray-500">
                          {app.profiles?.role || "—"}
                        </td>
                        <td className="py-4 pr-6 text-gray-400">
                          {new Date(app.created_at).toLocaleDateString("en-ZA", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </td>
                        <td className="py-4 pr-6">
                          <StatusBadge status={app.status} />
                        </td>
                        {isAdmin && (
                          <td className="py-4">
                            {app.status === "pending" ? (
                              <section className="flex gap-2">
                                <button
                                  onClick={() => handleGrant(app)}
                                  disabled={actionLoading === app.id}
                                  className="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                  {actionLoading === app.id ? "…" : "Grant"}
                                </button>
                                <button
                                  onClick={() => handleReject(app.id)}
                                  disabled={actionLoading === app.id}
                                  className="px-3 py-1.5 text-xs font-semibold bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50 transition"
                                >
                                  {actionLoading === app.id ? "…" : "Reject"}
                                </button>
                              </section>
                            ) : (
                              <p className="text-xs text-gray-400 italic">No actions</p>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </section>
        </section>
      </main>
    </section>
  );
}