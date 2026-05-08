// src/pages/ValidationPipeline.jsx
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/useAuth";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import JobCard from "../components/dashboard/JobCard";

const API_URL = import.meta.env.VITE_API_URL;

const FILTER_TABS = ["all", "pending", "approved", "rejected"];

const ValidationPipeline = () => {
  const [jobs, setJobs] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [authChecked, setAuthChecked] = useState(false);
  const { user } = useAuth();

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
        duration,
        stipend,
        closing_date,
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
      if (!user) {
        setAuthChecked(true);
        return;
      }

      await fetchOpportunities(user);
      setAuthChecked(true);
    };

    initialize();
  }, [user, fetchOpportunities]);

  const counts = {
    all: jobs.length,
    approved: jobs.filter((j) => j.status === "approved").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  if (!authChecked) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#035b9d] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="ml-64 flex flex-col min-h-screen w-full min-w-0">
        <Topbar user={user} onLogout={handleLogout} />

        <section className="p-8">
          {/* Header */}
          <header className="flex justify-between items-start mb-8">
            <div>
              <h1 className="font-headline text-4xl font-bold tracking-tight text-[#1b1c1c] mb-2">
                Validation Pipeline
              </h1>
              <p className="text-sm text-[#707881] mt-1">
                Track the status of your submitted opportunities
              </p>
            </div>
          </header>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#035b9d]">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#707881] font-medium">
                  Total
                </p>
                <span className="material-symbols-outlined text-[#035b9d] text-xl">
                  work
                </span>
              </div>
              <p className="text-2xl font-bold text-[#0d1b2a] mt-1">
                {counts.all}
              </p>
            </article>

            <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#707881] font-medium">
                  Approved
                </p>
                <span className="material-symbols-outlined text-green-600 text-xl">
                  verified
                </span>
              </div>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {counts.approved}
              </p>
            </article>

            <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#707881] font-medium">
                  Pending
                </p>
                <span className="material-symbols-outlined text-yellow-500 text-xl">
                  hourglass_empty
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {counts.pending}
              </p>
            </article>

            

            <article className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#707881] font-medium">
                  Rejected
                </p>
                <span className="material-symbols-outlined text-red-500 text-xl">
                  cancel
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {counts.rejected}
              </p>
            </article>
          </section>

          {/* Filter Tabs */}
          <nav className="flex gap-2 border-b border-gray-200 pb-3 mb-6">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                  filter === tab
                    ? "bg-[#035b9d] text-white shadow-md"
                    : "text-[#404850] hover:bg-gray-100"
                }`}
              >
                {tab} ({counts[tab === "all" ? "all" : tab]})
              </button>
            ))}
          </nav>

          {/* Job List */}
          <section className="space-y-4">
            {error && (
              <p className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            {!error && filteredJobs.length === 0 && (
              <section className="text-center py-16 bg-white rounded-xl border border-gray-100">
                <span className="material-symbols-outlined text-4xl text-gray-300">
                  inbox
                </span>
                <p className="text-[#707881] mt-3 font-medium">
                  No opportunities found
                </p>
                <p className="text-sm text-[#707881] mt-1">
                  {filter !== "all"
                    ? `You have no ${filter} opportunities`
                    : "Submit your first opportunity to get started"}
                </p>
              </section>
            )}

            {!error &&
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  id={job.id}
                  title={job.title}
                  location={job.location}
                  duration={job.duration}
                  stipend={job.stipend}
                  closing_date={job.closing_date}
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
