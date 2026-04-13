// src/pages/ValidationPipeline.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import StatsCard from "../components/dashboard/StatsCard";
import JobCard from "../components/dashboard/JobCard";

const ValidationPipeline = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);
    setError(null);

    // Get logged-in user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      setError("Not logged in.");
      setLoading(false);
      return;
    }

    // Get their profile (role tells us if admin or provider)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      setError("Could not load profile.");
      setLoading(false);
      return;
    }

    let query = supabase
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
      .order("created_at", { ascending: false });

    // Providers only see their own opportunities; admins see all
    if (profile.role === "provider") {
      const { data: providerProfile, error: providerError } = await supabase
        .from("provider_profiles")
        .select("id")
        .eq("profile_id", profile.id)
        .single();

      if (providerError || !providerProfile) {
        setError("Provider profile not found.");
        setLoading(false);
        return;
      }

      query = query.eq("provider_id", providerProfile.id);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  };

  // Derive counts from real data
  const counts = {
    all: jobs.length,
    approved: jobs.filter((j) => j.status === "approved").length,
    pending: jobs.filter((j) => j.status === "pending").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  // Filter in-memory
  const filteredJobs =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <main className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <section className="ml-72 p-8">
        <h1 className="text-3xl font-bold">Validation Pipeline</h1>

        {/* Stats — real numbers from the DB */}
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

        {/* Filter tabs */}
        <section className="flex gap-3 mt-8">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1 rounded-full border capitalize ${
                filter === s
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600"
              }`}
            >
              {s}
              {s !== "all" && (
                <span className="ml-1 text-xs opacity-70">
                  ({counts[s]})
                </span>
              )}
            </button>
          ))}
        </section>

        {/* Job list */}
        <section className="mt-6 space-y-4">
          {loading && (
            <p className="text-gray-500">Loading opportunities...</p>
          )}

          {error && (
            <p className="text-red-500 bg-red-50 p-3 rounded">{error}</p>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <p className="text-gray-400 text-sm">
              No opportunities found
              {filter !== "all" ? ` with status "${filter}"` : ""}.
            </p>
          )}

          {!loading &&
            filteredJobs.map((job) => (
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