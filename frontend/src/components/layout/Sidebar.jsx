import { useNavigate, useLocation } from "react-router-dom";
import AdminSection from "../admin/AdminSection";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.from || "/pipeline";
  const adminOrigin = location.state?.from || location.pathname;

  // Read isAdmin from provider localStorage
  let isAdmin = false;
  try {
    const providerUser = localStorage.getItem("provider_user");
    if (providerUser) {
      isAdmin = Boolean(JSON.parse(providerUser)?.isAdmin);
    }
  } catch {
    isAdmin = false;
  }

  const isAdminMode = location.pathname.startsWith("/admin");

  const normalLinks = [
    { icon: "🔍", label: "Validation Pipeline", path: "/pipeline" },
    {icon: "📊", label: "Analytics Dashboard", path: "/analytics"}
  ];

  const adminLinks = [
    { icon: "🛡️", label: "Access Applications", path: "/admin/applications" },
    { icon: "⚙️", label: "Admin Console", path: "/admin/console" },
    { icon: "📈", label: "Admin Analytics", path: "/admin/analytics" }
  ];

  const links = isAdminMode ? adminLinks : normalLinks;

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">

      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
        <p className="text-xs text-gray-400 mt-1">
          {isAdminMode ? "Admin Portal" : "Employer Portal"}
        </p>
      </header>

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path, { state: { source: "provider", from: adminOrigin } })}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              location.pathname === path
                ? "bg-[#d2e4ff] text-[#0077B6] font-semibold"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <i>{icon}</i>
            <strong>{label}</strong>
          </button>
        ))}
      </nav>

      {isAdminMode ? (
        <div className="space-y-3">
          {/* Grayed out Admin Portal indicator */}
          <div className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Admin Portal
          </div>

          <button
            onClick={() => navigate(returnTo, { state: { source: "provider" } })}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-[#035b9d] hover:bg-[#d2e4ff] transition-all duration-200 text-left font-semibold text-sm"
          >
            <span>↩️</span>
            <strong>Back to Portal</strong>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AdminSection isAdmin={isAdmin} source="provider" />

          <button
            onClick={() => navigate("/post")}
            className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
          >
            Post New Opportunity
          </button>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;