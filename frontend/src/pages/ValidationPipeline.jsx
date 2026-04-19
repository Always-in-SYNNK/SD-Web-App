// src/pages/ValidationPipeline.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatsCard from "../components/dashboard/StatsCard";
import JobCard from "../components/dashboard/JobCard";
//import AdminDebug from "../components/AdminDebug";

const ValidationPipeline = () => {
  const [jobs,        setJobs]        = useState([]);
  const [error,       setError]       = useState(null);
  const [filter,      setFilter]      = useState("all");
  const [user,        setUser]        = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const res  = await fetch("http://localhost:3000/api/auth/provider/me", { credentials: "include" });
      const data = await res.json();
      if (!data.authenticated) {
        window.location.href = "/prov-login";
        return null;
      }
      return data.user;
    } catch {
      window.location.href = "/prov-login";
      return null;
    }
  }, []);

  const fetchOpportunities = useCallback(async (currentUser) => {
    if (!currentUser) return;

    const { data: providerProfile, error: providerError } = await supabase
      .from("provider_profiles")
      .select("id")
      .eq("profile_id", currentUser.id)
      .single();

    if (providerError || !providerProfile) return;

    const { data, error: fetchError } = await supabase
      .from("opportunities")
      .select(`
        id,
        title,
        location,
        status,
        created_at,
        provider_profiles (
          organisation_name
        )
      `)
      .eq("provider_id", providerProfile.id)
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setJobs(data || []);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("http://localhost:3000/api/auth/provider/logout", { method: "POST", credentials: "include" });
      localStorage.removeItem("provider_user");
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      const currentUser = await checkAuth();
      setUser(currentUser);
      await fetchOpportunities(currentUser);
      setAuthChecked(true);
    };
    initialize();
  }, [checkAuth, fetchOpportunities]);

  const counts = {
    all:      jobs.length,
    approved: jobs.filter((j) => j.status === "approved").length,
    pending:  jobs.filter((j) => j.status === "pending").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  const filteredJobs = filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar user={user} onLogout={handleLogout} />

      {/* ml-64 matches sidebar w-64; pt-16 clears the fixed Topbar */}
      <section className="ml-64 pt-16 p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Validation Pipeline</h1>
        </header>

        <section className="grid grid-cols-3 gap-4 mt-6">
          <StatsCard title="Approved"         value={counts.approved} icon="verified" />
          <StatsCard title="Pending Approval" value={counts.pending}  icon="hourglass_empty" />
          <StatsCard title="Rejected"         value={counts.rejected} icon="cancel" />
        </section>

        <section className="flex gap-3 mt-8">
          {["all", "pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`px-4 py-1 rounded-full border capitalize ${
                filter === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600"
              }`}
            >
              {status}
              {status !== "all" && (
                <small className="ml-1 text-xs opacity-70">({counts[status]})</small>
              )}
            </button>
          ))}
        </section>

        <section className="mt-6 space-y-4">
          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded">{error}</p>
          )}
          {!error && filteredJobs.length === 0 && (
            <p className="text-gray-400 text-sm">
              No opportunities found{filter !== "all" ? ` with status "${filter}"` : ""}.
            </p>
          )}
          {!error && filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              title={job.title}
              location={job.location || "Location not specified"}
              status={job.status}
            />
          ))}
        </section>
      </section>
    </main>
  );
};

export default ValidationPipeline;