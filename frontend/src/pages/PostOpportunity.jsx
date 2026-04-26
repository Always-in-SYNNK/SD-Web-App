// src/pages/PostOpportunity.jsx
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import OpportunityForm from "../components/forms/OpportunityForm";

const PostOpportunity = () => {
  return (
  <div className="flex min-h-screen bg-gray-50">
    <Sidebar />

    <div className="ml-64 flex flex-col min-h-screen w-full min-w-0">
      <Topbar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Post New Opportunity</h1>
        <OpportunityForm />
      </main>
    </div>
  </div>
  );
}

export default PostOpportunity; 