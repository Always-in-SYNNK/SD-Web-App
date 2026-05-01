// src/pages/PostOpportunity.jsx
import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";
import OpportunityForm from "../components/forms/OpportunityForm";

const PostOpportunity = () => {
  return (
    <main className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <section className="ml-64 flex flex-col min-h-screen w-full min-w-0">
        <Topbar />

        <section className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
              <small className="text-sm font-semibold tracking-wider text-[#035b9d] uppercase">Post New Opportunity</small>
            <OpportunityForm />
          </div>
        </section>
      </section>
    </main>
  );
}

export default PostOpportunity; 