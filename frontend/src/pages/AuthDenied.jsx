/**
 * AuthDenied
 * Shown when a user tries to access a page they don't have permission for.
 * Self-contained — no custom Tailwind tokens, no global CSS changes needed.
 *
 * Uses React Router navigation.
 */

import { useNavigate } from "react-router-dom";
import useAuthFonts from "../components/auth/useAuthFonts";

const iconStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
const iconStyleFilled = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "2.25rem" };

const LogoMark = () => (
  <figure className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white shrink-0" aria-hidden="true">
    <svg className="w-6 h-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13.8261 17.4264C16.7203 18.1174 20.2244 18.5217 24 18.5217C27.7756 18.5217 31.2797 18.1174
           34.1739 17.4264C36.9144 16.7722 39.9967 15.2331 41.3563 14.1648L24.8486 40.6391C24.4571
           41.267 23.5429 41.267 23.1514 40.6391L6.64374 14.1648C8.00331 15.2331 11.0856 16.7722
           13.8261 17.4264Z"
        fill="currentColor"
      />
    </svg>
  </figure>
);

const BackgroundLayers = () => (
  <aside className="fixed inset-0 -z-10 bg-slate-50" aria-hidden="true">
    <div className="absolute inset-0 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(30,58,138,0.05)_0%,transparent_100%)]" />
    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.01)_0%,rgba(30,58,138,0.02)_100%)]" />
  </aside>
);

export default function AuthDenied() {
  useAuthFonts();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4">

      {/* ── Minimal nav ── */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <header className="flex items-center gap-2">
          <LogoMark />
          <strong
            className="text-blue-900 font-bold text-xl tracking-tight"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            GrowthStage SA
          </strong>
        </header>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
        >
          <i
            className="material-symbols-outlined not-italic"
            aria-hidden="true"
            style={iconStyle}
          >
            arrow_back
          </i>
          Back to Home
        </button>
      </nav>

      {/* ── Error card ── */}
      <main className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <article className="p-8 flex flex-col items-center text-center">

          {/* Icon */}
          <figure className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-6" aria-hidden="true">
            <section className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              <i
                className="material-symbols-outlined not-italic"
                style={iconStyleFilled}
              >
                lock
              </i>
            </section>
          </figure>

          <h1 className="text-2xl font-bold text-blue-900 mb-3">Access Denied</h1>

          <p className="text-gray-600 mb-8 leading-relaxed">
            You do not have permission to view this page. 
            Please make sure you are logged in with the correct account.
          </p>

          <footer className="w-full space-y-3">
            <button
              type="button"
              onClick={handleReturn}
              className="w-full py-3 px-4 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <i
                className="material-symbols-outlined not-italic"
                aria-hidden="true"
                style={iconStyle}
              >
                dashboard
              </i>
              Return
            </button>
          </footer>

        </article>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-8 text-gray-400 text-xs uppercase tracking-widest font-medium">
        © {new Date().getFullYear()} GrowthStage South Africa •{" "}
        <a href="/privacy" className="hover:text-blue-900 transition-colors">
          Privacy Policy
        </a>
      </footer>

      <BackgroundLayers />
    </section>
  );
}
