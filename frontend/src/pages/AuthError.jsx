import useAuthFonts from "../components/auth/useAuthFonts";
import { useNavigate, useLocation } from "react-router-dom";

/* ─── Sub-components ──────────────────────────────────────────────────────── */

const LogoMark = () => (
  <figure className="w-8 h-8 bg-blue-900 rounded flex items-center justify-center text-white shrink-0" aria-hidden="true">
    {/* NOTE: This is the chevron/diamond logo from the error page mockup.
        Swap with your GrowthStageLogo SVG if you want them consistent. */}
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

/* Shared inline style for all Material Symbols icons on this page */
const iconStyle = { fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" };
const iconStyleFilled = { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24", fontSize: "2.25rem" };

/* ─── Page ────────────────────────────────────────────────────────────────── */

const DEFAULT_MESSAGE =
  "We couldn't verify your credentials. Please try again or check your account details.";

export default function AuthErrorPage({
  loginPage = "app-login",
  message   = DEFAULT_MESSAGE,
}) {
  useAuthFonts();
  const navigate = useNavigate();
  const location = useLocation();

  const effectiveLoginPage = location.state?.loginPage || loginPage;
  const effectiveMessage = location.state?.message || message;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center p-4">

      {/* ── Minimal nav ── */}
      <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center w-full max-w-7xl mx-auto">
        <header className="flex items-center gap-2">
          <LogoMark />
          <span
            className="text-blue-900 font-bold text-xl tracking-tight"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            GrowthStageSA
          </span>
        </header>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm font-semibold text-blue-900 hover:underline"
        >
          <i
            className="material-symbols-outlined"
            aria-hidden="true"
            style={iconStyle}
          >
            arrow_back
          </i>
          Back to Home
        </button>
      </nav>

      {/* ── Error card ── */}
      <article className="w-full max-w-md bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col items-center text-center">

          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mb-6" aria-hidden="true">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-900">
              <i
                className="material-symbols-outlined"
                style={iconStyleFilled}
              >
                lock_reset
              </i>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-blue-900 mb-3">Authentication Failed</h1>

          <p className="text-gray-600 mb-8 leading-relaxed">{effectiveMessage}</p>

          <div className="w-full space-y-3">
            <button
              type="button"
              onClick={() => navigate(`/${effectiveLoginPage}`)}
              className="w-full py-3 px-4 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
            >
              <i
                className="material-symbols-outlined"
                aria-hidden="true"
                style={iconStyle}
              >
                refresh
              </i>
              Retry Login
            </button>
          </div>

        </div>
      </article>

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
