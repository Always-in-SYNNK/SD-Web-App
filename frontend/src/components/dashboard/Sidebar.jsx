// src/components/dashboard/Sidebar.jsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

export function Sidebar() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { icon: "🎓", label: "Qualifications",              path: "/qualifications" },
    { icon: "💼", label: "Opportunities",               path: "/opportunities" },
    { icon: "📄", label: "Applications",                path: "/applications" },
    { icon: "📊", label: "Analytics",                   path: "/analytics" },
    { icon: "✅", label: "Verification",                path: "/verification" },
    { icon: "🛠️", label: "Admin console",              path: "/admin" },
    { icon: "🔐", label: "Admin Access Applications",   path: "/admin-access" },
    // TODO: once auth is integrated, only show the two admin links
    // when user.role === "admin"
  ];

  const handleNav = (label, path) => {
    if (label === "Admin console") {
      navigate("/admin", { state: { source: "applicant" } });
    } else if (label === "Admin Access Applications") {
      navigate("/admin-access", { state: { source: "applicant" } });
    } else {
      navigate(path);
    }
  };

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">
      <header>
        <strong className="text-xl font-extrabold text-[#0077B6]">
          Growthstage
        </strong>
      </header>

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

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, path }) => (
          <button
            key={label}
            onClick={() => handleNav(label, path)}
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
        onClick={() => navigate("/profile/edit")}
        className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition"
      >
        Update Profile
      </button>

      <nav className="space-y-2">
        <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]">
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