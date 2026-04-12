import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/TopBar";
import StatsCard from "../components/dashboard/StatsCard";
import JobCard from "../components/dashboard/JobCard";

const ValidationPipeline = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected'

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    setLoading(true);

    // Get logged-in user's provider_profile so they only see THEIR opportunities
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from("profiles").select("id, role").eq("user_id", user.id).single();
    const { data: providerProfile } = await supabase
      .from("provider_profiles").select("id").eq("profile_id", profile.id).single();

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

    // Admins see all; providers only see their own
    if (profile.role === "provider") {
      query = query.eq("provider_id", providerProfile.id);
    }

    const { data, error } = await query;
    if (!error) setJobs(data);
    setLoading(false);
  };

  // Filter in-memory by status tab
  const filteredJobs = filter === "all"
    ? jobs
    : jobs.filter((j) => j.status === filter);

  // Counts for StatsCards — derived from real data
  const counts = {
    approved: jobs.filter((j) => j.status === "approved").length,
    pending:  jobs.filter((j) => j.status === "pending").length,
    rejected: jobs.filter((j) => j.status === "rejected").length,
  };

  return (
    <main className="min-h-screen bg-gray-50">

      <Sidebar />
      <Topbar />

      <main className="ml-72 p-8">
        <h1 className="text-3xl font-bold">Validation Pipeline</h1>

        <section className="grid grid-cols-3 gap-4 mt-6">
          <StatsCard title="Validated Roles" value="24" icon="verified" />
          <StatsCard title="Pending" value="08" icon="hourglass_empty" />
          <StatsCard title="Drafts" value="04" icon="pending_actions" />
        </section>

        {/* Filter tabs */}
        <section className="flex gap-3 mt-8">
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1 rounded-full border capitalize ${
                filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600"
              }`}
            >
              {s}
            </button>
          ))}
        </section>

        {/* 🔴 BACKEND LOGIC NEEDED */}
        {/* Filter jobs by:
            - Draft
            - Pending Approval
            - Validated
        */}

      </main>
    </main>
  );
};

export default ValidationPipeline;