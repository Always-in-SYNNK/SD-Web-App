import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { icon: "🎓", label: "Qualifications", path: "/qualifications" },
    { icon: "💼", label: "Opportunities", path: "/opportunities" },
    { icon: "📄", label: "Applications", path: "/applications" },
    { icon: "📊", label: "Analytics", path: "/analytics" },
    { icon: "✅", label: "Verification", path: "/verification" },
    { icon: "🛠️", label: "Admin console", path: "/admin" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">
      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
      </header>

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() =>
              label === "Admin console"
                ? navigate("/admin", { state: { source: "applicant" } })
                : navigate(path)
            }
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

      <button
        onClick={() => navigate("/profile")}
        className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
      >
        View Profile
      </button>

      <nav className="space-y-2">
        <a
          href="#"
          className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]"
        >
          <i>⚙️</i>
          <strong>Settings</strong>
        </a>
        <button
          onClick={() => {
            localStorage.setItem("__logout_redirect", "true");
            localStorage.removeItem("provider_user");
            logout();
            navigate("/", { replace: true }); 
          }}
          className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
        >
          <i>🚪</i>
          <strong>Logout</strong>
        </button>
      </nav>
    </aside>
  );
}