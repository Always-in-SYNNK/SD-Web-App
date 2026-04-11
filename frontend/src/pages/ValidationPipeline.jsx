import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/TopBar";
import StatsCard from "../components/dashboard/StatsCard";
import JobCard from "../components/dashboard/JobCard";

const ValidationPipeline = () => {
  // 🔴 BACKEND NEEDED HERE
  // Fetch all opportunities:
  // GET /api/opportunities

  const jobs = [
    {
      title: "Senior Infrastructure Engineer",
      location: "Johannesburg",
      status: "Validated",
    },
    {
      title: "Graduate Quantity Surveyor",
      location: "Durban",
      status: "Pending",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />
      <Topbar />

      <main className="ml-72 p-8">

        <h1 className="text-3xl font-bold">Validation Pipeline</h1>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <StatsCard title="Validated Roles" value="24" icon="verified" />
          <StatsCard title="Pending" value="08" icon="hourglass_empty" />
          <StatsCard title="Drafts" value="04" icon="pending_actions" />
        </div>

        <div className="mt-10 space-y-4">
          {jobs.map((job, index) => (
            <JobCard key={index} {...job} />
          ))}
        </div>

        {/* 🔴 BACKEND LOGIC NEEDED */}
        {/* Filter jobs by:
            - Draft
            - Pending Approval
            - Validated
        */}

      </main>
    </div>
  );
};

export default ValidationPipeline;