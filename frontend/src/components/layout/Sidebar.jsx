import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed left-0 top-0 h-full w-72 bg-slate-50 p-6">

      <h1 className="text-xl font-bold mb-6">Employer Portal</h1>

      {/* 🏠 NEW HOME BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="block w-full text-left p-3 hover:bg-gray-200 rounded"
      >
        Home
      </button>

      <button
        onClick={() => navigate("/define")}
        className="block w-full text-left p-3 hover:bg-gray-200 rounded"
      >
        Define Requirements
      </button>

      <button
        onClick={() => navigate("/pipeline")}
        className="block w-full text-left p-3 hover:bg-gray-200 rounded"
      >
        Validation Pipeline
      </button>

      <button
        onClick={() => navigate("/post")}
        className="mt-10 w-full py-3 bg-blue-600 text-white rounded-full"
      >
        Post New Opportunity
      </button>

      {/* 🔴 BACKEND NOTE:
          Could show different menu based on user role */}
    </nav>
  );
};

export default Sidebar;