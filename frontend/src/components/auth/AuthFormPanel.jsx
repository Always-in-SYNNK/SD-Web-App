/**
 * AuthFormPanel
 * Right-side white shell. No custom Tailwind tokens.
 *
 * Props:
 *   onBack   {function}   e.g. () => setPage('home')
 *   children {ReactNode}  Page-specific auth content
 */

const GrowthStageLogomark = () => (
  <div className="size-8 text-blue-800" aria-hidden="true">
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44
           C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44
           C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144
           17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31
           C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24
           C44 35.0457 40.7439 44 36.7273 44Z"
        fill="currentColor"
      />
    </svg>
  </div>
);

export default function AuthFormPanel({ onBack, children }) {
  return (
    <section className="w-full md:w-1/2 lg:w-2/5 flex flex-col bg-white">

      {/* ── Header ── */}
      <header className="p-8 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-800 transition-colors group"
        >
          <span
            className="material-symbols-outlined transition-transform group-hover:-translate-x-1"
            aria-hidden="true"
            style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
          >
            arrow_back
          </span>
          <span className="text-sm font-semibold">Back to home</span>
        </button>

        {/* Mobile-only logomark */}
        <div className="md:hidden">
          <GrowthStageLogomark />
        </div>
      </header>

      {/* ── Page-specific content slot ── */}
      <main className="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-16 lg:px-20 pb-24">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="p-8">
        <p className="text-slate-400 text-[11px] text-center max-w-xs mx-auto leading-relaxed uppercase tracking-wider font-medium">
          By continuing, you agree to GrowthStage South Africa&apos;s{" "}
          <a
            href="/terms"
            className="text-blue-800 hover:text-sky-500 transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-sky-500"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/privacy"
            className="text-blue-800 hover:text-sky-500 transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-sky-500"
          >
            Privacy Policy
          </a>
          .
        </p>
      </footer>

    </section>
  );
}
