// src/pages/ValidationPipeline.jsx
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatsCard from "../components/dashboard/StatsCard";
import JobCard from "../components/dashboard/JobCard";

const API_URL = import.meta.env.VITE_API_URL;

const ValidationPipeline = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/provider/me`, {
        credentials: "include",
      });
      const data = await response.json();
      
      if (!data.authenticated) {
        window.location.href = "/prov-login";
        return null;
      }
      return data.user;
    } catch (err) {
      console.error("Auth check failed:", err);
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
      await fetch(`${API_URL}/api/auth/provider/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("provider_user");
      localStorage.setItem("__logout_redirect", "true");
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
    all: jobs.length,
    approved: jobs.filter((job) => job.status === "approved").length,
    pending: jobs.filter((job) => job.status === "pending").length,
    rejected: jobs.filter((job) => job.status === "rejected").length,
  };

  const filteredJobs = filter === "all" ? jobs : jobs.filter((job) => job.status === filter);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />

    <div className="ml-64 flex flex-col min-h-screen w-full min-w-0">
      <Topbar user={user} onLogout={handleLogout} />

      <section className="p-8">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Validation Pipeline</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors bg-white rounded-lg border border-red-200 hover:bg-red-50"
          >
            Sign Out
          </button>
        </header>

        <section className="grid grid-cols-3 gap-4 mt-6">
          <StatsCard
            title="Approved"
            value={counts.approved}
            icon="verified"
          />
          <StatsCard
            title="Pending Approval"
            value={counts.pending}
            icon="hourglass_empty"
          />
          <StatsCard
            title="Rejected"
            value={counts.rejected}
            icon="cancel"
          />
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
                <small className="ml-1 text-xs opacity-70">
                  ({counts[status]})
                </small>
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
              No opportunities found
              {filter !== "all" ? ` with status "${filter}"` : ""}.
            </p>
          )}

          {!error &&
            filteredJobs.map((job) => (
             <JobCard
              key={job.id}
              id={job.id}
              title={job.title}
              location={job.location}
              status={job.status}
            />
            ))}
        </section>
      </section>
    </div>
  </div>
);
};

export default ValidationPipeline;