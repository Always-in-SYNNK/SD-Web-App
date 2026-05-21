/**
 * AuthHeroPanel
 * Left-side visual panel. Fully self-contained:
 *   - No custom Tailwind tokens (uses standard equivalents)
 *   - No changes to tailwind.config.js or index.html required
 *   - Fonts injected into <head> via useAuthFonts on mount
 */

import useAuthFonts from "./useAuthFonts";

/* Replaces .bg-grid-overlay — no global CSS class needed */
const gridOverlayStyle = {
  backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)
  `,
  backgroundSize: "40px 40px",
};

const GrowthStageLogo = () => (
  <div className="size-10" aria-hidden="true">
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44
           C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44
           C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144
           17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31
           C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24
           C44 35.0457 40.7439 44 36.7273 44Z"
        fill="white"
      />
    </svg>
  </div>
);

const defaultBadges = [
  { icon: "verified", label: "SETA Accredited" },
  { icon: "school",   label: "Skills Tracking"  },
];

export default function AuthHeroPanel({
  headline = "Build Your Future,",
  accentLine = "One skill at a time.",
  badges = defaultBadges,
  backgroundImageUrl,
  accentColor = "text-sky-400", // default blue-sky
  badgeBgColor = "bg-white/10",
}) {
  useAuthFonts();

  return (
    <section
      className="hidden md:flex md:w-1/2 lg:w-3/5 relative items-center justify-center bg-blue-950 p-12 overflow-hidden"
      aria-hidden="true"
    >
      {/* Background layers (same) */}
      <div className="absolute inset-0 z-0">
        {backgroundImageUrl && (
          <img
            alt=""
            className="w-full h-full object-cover mix-blend-overlay opacity-40"
            src={backgroundImageUrl}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800/75 to-blue-950/70" />
        <div className="absolute inset-0 opacity-40" style={gridOverlayStyle} />
      </div>

      {/* Content */}
      <div className="relative z-20 max-w-xl">
        <div className="mb-12 flex items-center gap-3 text-white">
          <GrowthStageLogo />
          <span
            className="text-2xl font-black tracking-tight"
            style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
          >
            GrowthStageSA
          </span>
        </div>

        <h1
          className="text-white text-6xl lg:text-8xl font-black leading-tight tracking-tight mb-6"
          style={{ fontFamily: "'Public Sans', system-ui, sans-serif" }}
        >
          {headline}
          <br />
          <span className={accentColor}>{accentLine}</span>
        </h1>

        {badges.length > 0 && (
          <ul className="flex flex-wrap gap-4 list-none p-0 m-0">
            {badges.map(({ icon, label }) => (
              <li
                key={label}
                className={`flex items-center gap-2 px-5 py-3 ${badgeBgColor} backdrop-blur-md rounded-xl border border-white/20 text-white text-sm font-semibold`}
              >
                <i
                  className={`material-symbols-outlined ${accentColor} text-lg`}
                  aria-hidden="true"
                  style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
                >
                  {icon}
                </i>
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}