import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/TopBar";
import RequirementsForm from "../components/forms/RequirementsForm";

const DefineRequirements = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <Topbar />

      <main className="ml-72 p-8">
        <h1 className="text-3xl font-bold mb-6">Define Requirements</h1>

        <RequirementsForm />
      </main>
    </div>
  );
};

export default DefineRequirements;