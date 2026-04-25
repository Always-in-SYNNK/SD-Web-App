import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AdminSection from "../admin/AdminSection";

const Sidebar = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);

  const links = [
    { icon: "🏠", label: "Home", path: "/" },
    { icon: "📋", label: "Define Requirements", path: "/define" },
    { icon: "🔍", label: "Validation Pipeline", path: "/pipeline" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">
      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
        <p className="text-xs text-gray-400 mt-1">Employer Portal</p>
      </header>

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              window.location.pathname === path
                ? "bg-[#d2e4ff] text-[#0077B6] font-semibold"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <i>{icon}</i>
            <strong>{label}</strong>
          </button>
        ))}
      </nav>

      <AdminSection isAdmin={isAdmin} source="provider" />

      <button
        onClick={() => navigate("/post")}
        className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
      >
        Post New Opportunity
      </button>
    </aside>
  );
};

export default Sidebar;