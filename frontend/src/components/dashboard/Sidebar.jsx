import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import AdminSection from "../admin/AdminSection";

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const isAdmin = Boolean(user?.isAdmin);
  const returnTo = location.state?.from || "/dashboard";
  const adminOrigin = location.state?.from || location.pathname;
  const isAdminMode = location.pathname.startsWith("/admin");

  const normalLinks = [
    { icon: "🎓", label: "Qualifications", path: "/qualifications" },
    { icon: "💼", label: "Opportunities", path: "/opportunities" },
    { icon: "📄", label: "Applications", path: "/applications" },
    { icon: "📊", label: "Analytics", path: "/analytics" },
    { icon: "✅", label: "Verification", path: "/verification" },
  ];

  const adminLinks = [
    { icon: "🛡️", label: "Access Applications", path: "/admin/applications" },
    { icon: "⚙️", label: "Admin Console", path: "/admin/console" },
  ];

  const links = isAdminMode ? adminLinks : normalLinks;
  

  const handleLogout = () => {
    localStorage.setItem("__logout_redirect", "true");
    localStorage.removeItem("provider_user");
    logout();
    navigate("/", { replace: true });
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">

      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
        {isAdminMode && (
          <p className="text-xs text-gray-400 mt-1">Admin Portal</p>
        )}
      </header>

      {!isAdminMode && (
        <section className="flex items-center space-x-3 p-2">
          <figure className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-z7itmKWV7NjJbhpxnyw_qdsz2Il1QFJy6pvQjFEYVrBh8N8nY4RbU14flm7NenzotuJj7qfQypMOkAbdxfLzbDpq4T0CL1ItdaYiQHR1NdOehffuKgWfXwRbVbXcJ4tbwAVE_sv1cw3UOonk19nDe8NJcrGmdJpNadUb4Ezbb70yPYsBNN1rxhV9t3_FQMSOlT9M5FfTf1xhGzhbQe4t95P1S6Xf5LS9JxNzoX-CmGwKE6Axz-y83G5l8ATh10sk3X8vyX08Ajgf"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </figure>
          <section className="flex flex-col">
            <strong className="font-bold text-gray-800 truncate">
              The Resilient Architect
            </strong>
            <small className="text-xs text-gray-500">
              Professional Youth Portal
            </small>
          </section>
        </section>
      )}

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => navigate(path, { state: { source: "applicant", from: adminOrigin } })}
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
          <div className="w-full flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-400 rounded-lg text-sm font-semibold cursor-not-allowed">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
            </svg>
            Admin Portal
          </div>
          <button
            onClick={() => navigate(returnTo, { state: { source: "applicant" } })}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-[#035b9d] hover:bg-[#d2e4ff] transition-all duration-200 text-left font-semibold text-sm"
          >
            <strong>Back to Portal</strong>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <AdminSection isAdmin={isAdmin} source="applicant" />

          <button
            onClick={() => navigate("/profile/edit")}
            className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
          >
            Update Profile
          </button>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]"
            >
              <i>⚙️</i>
              <strong>Settings</strong>
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <i>🚪</i>
              <strong>Logout</strong>
            </button>
          </div>
        </div>
      )}

    </aside>
  );
}