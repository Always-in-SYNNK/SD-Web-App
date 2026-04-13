// src/pages/PostOpportunity.jsx
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import OpportunityForm from "../components/forms/OpportunityForm";

const PostOpportunity = () => {
  return (
    <main className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <section className="ml-72 p-8">
        <h1 className="text-3xl font-bold mb-6">Post New Opportunity</h1>
        <OpportunityForm />
      </section>
    </main>
  );
};

export default PostOpportunity;