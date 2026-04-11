import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/TopBar";
import OpportunityForm from "../components/forms/OpportunityForm";

const PostOpportunity = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-72 p-8">
        <h1 className="text-3xl font-bold mb-6">Post New Opportunity</h1>

        <OpportunityForm />
      </main>
    </div>
  );
};

export default PostOpportunity;