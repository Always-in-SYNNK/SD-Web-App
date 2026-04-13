import { useNavigate } from "react-router-dom";

export function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="w-full sticky top-0 z-50 bg-[#f5f3f3]/80 backdrop-blur-xl border-b border-gray-200">
      <section className="flex justify-between items-center px-8 py-4 max-w-screen-xl mx-auto">
        
        <header className="flex items-center gap-12">
          <a className="text-2xl font-bold text-[#0077B6]" href="/">Growthstage</a>
          <nav className="hidden md:flex gap-8">
            <a className="text-[#0077B6] font-bold border-b-2 border-[#0077B6] pb-1 text-sm">
              Our Vision
            </a>
          </nav>
        </header>

        <nav className="flex items-center gap-3">
          
          {/* APPLICANT */}
          <button
            onClick={() => navigate("/app-login", { state: { role: "applicant" } })}
            className="px-6 py-2 rounded-full text-sm font-semibold text-[#035b9d] hover:bg-blue-50 transition"
          >
            Applicant Portal
          </button>

          {/* EMPLOYER */}
          <button
            onClick={() => navigate("/pipeline", { state: { role: "provider" } })} //provider login
            className="px-6 py-2 rounded-full text-sm font-semibold bg-[#035b9d] text-white hover:opacity-90 transition"
          >
            Employer Portal
          </button>

        </nav>
      </section>
    </nav>
  );
}