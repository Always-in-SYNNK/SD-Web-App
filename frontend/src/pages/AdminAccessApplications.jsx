// src/pages/AdminAccessApplications.jsx
import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Sidebar as ApplicantSidebar } from "../components/dashboard/Sidebar";
import EmployerSidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import {
  getAdminApplications,
  grantAdminAccess,
  rejectAdminApplication,
} from "../services/adminService";

// ─── tiny stat card (mirrors AdminConsole's StatsGrid style) ───────────────
function StatCard({ label, value, color }) {
  return (
    <article className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </article>
  );
}

// ─── status badge ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:  "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${map[status] || "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function AdminAccessApplications() {
  const location = useLocation();
  const source = location.state?.source || "applicant";
  const SidebarComponent = source === "employer" ? EmployerSidebar : ApplicantSidebar;

  // For Topbar: provider uses session cookie; applicant uses Supabase
  const [topbarUser, setTopbarUser]   = useState(null);
  const [onLogout,   setOnLogout]     = useState(null);

  // Page state
  const [currentUserId,  setCurrentUserId]  = useState(null);
  const [isAdmin,        setIsAdmin]        = useState(false);
  const [pending,        setPending]        = useState([]);
  const [history,        setHistory]        = useState([]);
  const [filter,         setFilter]         = useState("all"); // all | pending | approved | rejected
  const [loading,        setLoading]        = useState(true);
  const [actionLoading,  setActionLoading]  = useState(null);

  // ── resolve logged-in user ────────────────────────────────────────────────
  useEffect(() => {
    const resolve = async () => {
      if (source === "employer") {
        try {
          const res  = await fetch("http://localhost:3000/api/auth/provider/me", { credentials: "include" });
          const data = await res.json();
          if (data.authenticated) {
            setTopbarUser(data.user);
            setCurrentUserId(data.user?.id);
            // wrap logout so we can pass it as a stable value
            setOnLogout(() => async () => {
              await fetch("http://localhost:3000/api/auth/provider/logout", { method: "POST", credentials: "include" });
              localStorage.removeItem("provider_user");
              window.location.href = "/";
            });

            // check admin via profiles table
            const { data: prof } = await supabase
              .from("profiles")
              .select("isAdmin, role")
              .eq("id", data.user.id)
              .single();
            setIsAdmin(!!(prof?.isAdmin || prof?.role === "admin"));
          }
        } catch {/* ignore */}
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("id, isAdmin, role")
            .eq("user_id", authUser.id)
            .single();
          if (prof) {
            setCurrentUserId(prof.id);
            setIsAdmin(!!(prof.isAdmin || prof.role === "admin"));
          }
        }
      }
      setLoading(false);
    };
    resolve();
  }, [source]);

  // ── fetch all applications (pending + history) ────────────────────────────
  const fetchAll = useCallback(async () => {
    // pending
    const pendingData = await getAdminApplications(); // already filters status=pending
    setPending(pendingData || []);

    // history (approved + rejected)
    const { data: hist } = await supabase
      .from("admin_applications")
      .select(`
        id,
        status,
        created_at,
        user_id,
        profiles (
          id,
          full_name,
          email,
          role
        )
      `)
      .in("status", ["approved", "rejected"])
      .order("created_at", { ascending: false });
    setHistory(hist || []);
  }, []);

  useEffect(() => {
    if (!loading) fetchAll();
  }, [loading, fetchAll]);

  // ── grant / reject ────────────────────────────────────────────────────────
  const handleGrant = async (app) => {
    setActionLoading(app.id);
    await grantAdminAccess(app);
    await fetchAll();
    setActionLoading(null);
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    await rejectAdminApplication(id);
    await fetchAll();
    setActionLoading(null);
  };

  // ── derived counts ────────────────────────────────────────────────────────
  const allRows    = [...pending, ...history];
  const approved   = history.filter(r => r.status === "approved");
  const rejected   = history.filter(r => r.status === "rejected");

  const displayRows = filter === "all"
    ? allRows
    : filter === "pending"
    ? pending
    : history.filter(r => r.status === filter);

  // ── loading gate ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen bg-[#faf9f8] flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf9f8]">
      <SidebarComponent />

      <main className="ml-64 min-h-screen w-full">

        {/* ── Topbar — matches AdminConsole header style ── */}
        <header className="sticky top-0 z-40 flex justify-between items-center px-12 h-16 bg-white border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">
            Admin Access Applications
          </h1>
          <div className="flex gap-3 items-center">
            {/* Reuse the shared Topbar avatar/logout widget */}
            <Topbar user={topbarUser} onLogout={onLogout || undefined} />
          </div>
        </header>

        <div className="p-12">

          {/* ── page intro ── */}
          <div className="mb-8">
            <span className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">
              Admin Panel
            </span>
            <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
              Manage Admin Applications
            </h2>
            <p className="text-gray-500 mt-2">
              Review who has requested admin access and manage their status.
            </p>
          </div>

          {/* ── stat cards ── */}
          <section className="grid grid-cols-3 gap-4 mb-10">
            <StatCard label="Total Applications" value={allRows.length}     color="text-gray-800" />
            <StatCard label="Pending Review"      value={pending.length}    color="text-yellow-600" />
            <StatCard label="Approved Admins"     value={approved.length}   color="text-green-600" />
          </section>

          {/* ── table section ── */}
          <div className="bg-[#f5f3f3] rounded-xl p-8">

            {/* table header + filter */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">All Applications</h3>
              <div className="flex gap-2">
                {["all", "pending", "approved", "rejected"].map(f => (
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
                    {f === "pending"  && ` (${pending.length})`}
                    {f === "approved" && ` (${approved.length})`}
                    {f === "rejected" && ` (${rejected.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* table */}
            {displayRows.length === 0 ? (
              <p className="text-gray-400 text-sm py-8 text-center">
                No applications found{filter !== "all" ? ` with status "${filter}"` : ""}.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-200">
                      <th className="pb-3 pr-6 font-semibold">Name</th>
                      <th className="pb-3 pr-6 font-semibold">Email</th>
                      <th className="pb-3 pr-6 font-semibold">Role</th>
                      <th className="pb-3 pr-6 font-semibold">Applied</th>
                      <th className="pb-3 pr-6 font-semibold">Status</th>
                      {isAdmin && (
                        <th className="pb-3 font-semibold">Actions</th>
                      )}
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
                              <div className="flex gap-2">
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
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400 italic">No actions</span>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}