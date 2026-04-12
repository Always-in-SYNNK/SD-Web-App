export function Sidebar({ setPage, activePage }) {
  const links = [
    { icon: "🎓", label: "Qualifications", page: "dashboard" },
    { icon: "💼", label: "Opportunities", page: "opportunities" },
    { icon: "📄", label: "Applications", page: "dashboard" },
    { icon: "📊", label: "Analytics", page: "dashboard" },
    { icon: "✅", label: "Verification", page: "dashboard" },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-white flex flex-col p-6 space-y-8 shadow-xl text-sm font-medium z-50">
      <div>
        <span className="text-xl font-extrabold text-[#0077B6]">Growthstage</span>
      </div>

      <div className="flex items-center space-x-3 p-2">
        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD-z7itmKWV7NjJbhpxnyw_qdsz2Il1QFJy6pvQjFEYVrBh8N8nY4RbU14flm7NenzotuJj7qfQypMOkAbdxfLzbDpq4T0CL1ItdaYiQHR1NdOehffuKgWfXwRbVbXcJ4tbwAVE_sv1cw3UOonk19nDe8NJcrGmdJpNadUb4Ezbb70yPYsBNN1rxhV9t3_FQMSOlT9M5FfTf1xhGzhbQe4t95P1S6Xf5LS9JxNzoX-CmGwKE6Axz-y83G5l8ATh10sk3X8vyX08Ajgf"
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-800 truncate">The Resilient Architect</span>
          <span className="text-xs text-gray-500">Professional Youth Portal</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {links.map(({ icon, label, page }) => (
          <button
            key={label}
            onClick={() => setPage(page)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
              activePage === page && label === (activePage === "opportunities" ? "Opportunities" : "Qualifications")
                ? "bg-[#d2e4ff] text-[#0077B6] font-semibold"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <button className="w-full bg-[#035b9d] text-white py-3 rounded-full text-sm font-semibold hover:opacity-90 transition">
        Update Profile
      </button>

      <div className="space-y-2">
        <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]">
          <span>⚙️</span><span>Settings</span>
        </a>
        <a href="#" className="flex items-center space-x-3 px-4 py-2 text-gray-500 hover:text-[#035b9d]">
          <span>❓</span><span>Support</span>
        </a>
      </div>
    </aside>
  );
}