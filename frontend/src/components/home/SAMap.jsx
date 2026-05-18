// frontend/src/components/SAMap.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// All province paths drawn in a 800x650 SVG viewport
const PROVINCES = [
  {
    id: "limpopo",
    name: "Limpopo",
    capital: "Polokwane",
    opportunities: 42,
    color: "#1a5f8a",
    path: "M 375 8 L 762 8 L 785 32 L 782 98 L 762 142 L 728 158 L 698 138 L 662 158 L 618 178 L 572 174 L 542 186 L 512 170 L 492 182 L 456 154 L 442 108 L 438 58 L 375 35 Z",
    labelX: 582, labelY: 95
  },
  {
    id: "north-west",
    name: "North West",
    capital: "Mahikeng",
    opportunities: 35,
    color: "#1a5f8a",
    path: "M 225 52 L 375 8 L 375 35 L 438 58 L 442 108 L 456 154 L 492 182 L 488 218 L 462 242 L 428 266 L 372 266 L 332 254 L 288 240 L 248 198 Z",
    labelX: 348, labelY: 155
  },
  {
    id: "gauteng",
    name: "Gauteng",
    capital: "Johannesburg",
    opportunities: 186,
    color: "#1a5f8a",
    path: "M 492 182 L 512 170 L 542 186 L 542 216 L 536 238 L 506 242 L 488 218 Z",
    labelX: 518, labelY: 205,
    isSmall: true
  },
  {
    id: "mpumalanga",
    name: "Mpumalanga",
    capital: "Mbombela",
    opportunities: 38,
    color: "#1a5f8a",
    path: "M 542 186 L 572 174 L 618 178 L 662 158 L 698 138 L 728 158 L 762 142 L 788 172 L 800 252 L 778 292 L 748 312 L 708 302 L 672 282 L 638 296 L 602 265 L 572 240 L 542 236 L 536 238 L 542 216 Z",
    labelX: 658, labelY: 232
  },
  {
    id: "free-state",
    name: "Free State",
    capital: "Bloemfontein",
    opportunities: 54,
    color: "#1a5f8a",
    path: "M 372 266 L 428 266 L 462 242 L 488 218 L 506 242 L 536 238 L 572 240 L 602 265 L 638 296 L 658 322 L 648 372 L 638 412 L 598 428 L 562 438 L 528 448 L 488 452 L 452 446 L 418 436 L 382 422 L 358 402 L 332 375 L 312 346 L 304 312 L 308 280 L 332 254 L 372 266 Z",
    labelX: 484, labelY: 358
  },
  {
    id: "kwazulu-natal",
    name: "KwaZulu-Natal",
    capital: "Pietermaritzburg",
    opportunities: 78,
    color: "#1a5f8a",
    path: "M 638 296 L 672 282 L 708 302 L 748 312 L 778 292 L 800 252 L 800 392 L 784 432 L 768 468 L 742 492 L 718 508 L 688 508 L 662 492 L 642 466 L 640 442 L 650 412 L 638 412 L 648 372 L 658 322 Z",
    labelX: 718, labelY: 388
  },
  {
    id: "northern-cape",
    name: "Northern Cape",
    capital: "Kimberley",
    opportunities: 28,
    color: "#1a5f8a",
    path: "M 8 8 L 225 8 L 225 52 L 248 198 L 288 240 L 332 254 L 308 280 L 304 312 L 312 346 L 332 375 L 308 402 L 278 432 L 238 456 L 192 468 L 142 462 L 88 452 L 42 442 L 8 426 Z",
    labelX: 168, labelY: 288
  },
  {
    id: "western-cape",
    name: "Western Cape",
    capital: "Cape Town",
    opportunities: 67,
    color: "#1a5f8a",
    path: "M 8 426 L 42 442 L 88 452 L 142 462 L 192 468 L 238 456 L 278 432 L 308 402 L 332 375 L 358 402 L 338 442 L 328 482 L 313 518 L 292 542 L 262 562 L 228 576 L 193 582 L 153 580 L 113 570 L 78 552 L 48 526 L 22 496 L 8 462 Z",
    labelX: 192, labelY: 492
  },
  {
    id: "eastern-cape",
    name: "Eastern Cape",
    capital: "Bhisho",
    opportunities: 61,
    color: "#1a5f8a",
    path: "M 332 375 L 358 402 L 382 422 L 418 436 L 452 446 L 488 452 L 528 448 L 562 438 L 598 428 L 638 412 L 650 412 L 640 442 L 642 466 L 662 492 L 688 508 L 718 508 L 742 492 L 768 468 L 784 432 L 800 392 L 800 522 L 778 562 L 748 598 L 718 618 L 678 632 L 638 642 L 598 646 L 558 646 L 518 639 L 478 628 L 438 618 L 403 607 L 373 592 L 348 576 L 328 555 L 313 530 L 313 518 L 328 482 L 338 442 L 358 402 Z",
    labelX: 568, labelY: 538
  }
];

const GAUTENG_CALLOUT = {
  lineX1: 518, lineY1: 205,
  lineX2: 565, lineY2: 148,
  textX: 570, textY: 140
};

export default function SAMap() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const hoveredProvince = PROVINCES.find(p => p.id === hovered);

  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.closest("svg").getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setHovered(id);
  };

  return (
    <section className="py-20 px-4 md:px-8 bg-white">
      <section className="max-w-[1280px] mx-auto">
        <header className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#004377]">
            Opportunities Across{" "}
            <strong className="text-[#f59e0b]">South Africa</strong>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Hover over any province to explore learnerships and internships available nationwide
          </p>
        </header>

        <section className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* SVG Map */}
          <section className="flex-1 relative bg-gradient-to-br from-[#001c37] to-[#004377] rounded-2xl p-4 md:p-6 shadow-2xl border border-[#004377]/20 overflow-hidden">
            <section
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #f59e0b 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
            />

            <svg
              viewBox="0 0 808 660"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto relative z-10"
              style={{ filter: "drop-shadow(0 4px 24px rgba(0,0,0,0.35))" }}
            >
              <defs>
                <filter id="province-glow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="hover-glow">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              <rect x="0" y="0" width="808" height="660" fill="rgba(0,67,119,0.25)" rx="8" />

              {PROVINCES.map((province) => {
                const isHovered = hovered === province.id;
                return (
                  <g key={province.id}>
                    {isHovered && (
                      <path
                        d={province.path}
                        fill="#f59e0b"
                        opacity="0.25"
                        filter="url(#hover-glow)"
                        style={{ pointerEvents: "none" }}
                      />
                    )}
                    <path
                      d={province.path}
                      fill={isHovered ? "#f59e0b" : "rgba(0, 120, 200, 0.45)"}
                      stroke={isHovered ? "#f59e0b" : "rgba(255,255,255,0.35)"}
                      strokeWidth={isHovered ? "2" : "1"}
                      style={{
                        transition: "fill 0.2s ease, stroke 0.2s ease",
                        cursor: "pointer"
                      }}
                      onMouseMove={(e) => handleMouseMove(e, province.id)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => navigate("/opportunities")}
                    />
                    {!province.isSmall && (
                      <text
                        x={province.labelX}
                        y={province.labelY}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={isHovered ? "#001c37" : "rgba(255,255,255,0.85)"}
                        style={{
                          pointerEvents: "none",
                          transition: "fill 0.2s ease",
                          fontFamily: "sans-serif",
                          letterSpacing: "0.3px"
                        }}
                      >
                        {province.name.toUpperCase()}
                      </text>
                    )}
                  </g>
                );
              })}

              <line
                x1={GAUTENG_CALLOUT.lineX1}
                y1={GAUTENG_CALLOUT.lineY1}
                x2={GAUTENG_CALLOUT.lineX2}
                y2={GAUTENG_CALLOUT.lineY2}
                stroke={hovered === "gauteng" ? "#f59e0b" : "rgba(255,255,255,0.55)"}
                strokeWidth="1"
                strokeDasharray="3 2"
                style={{ pointerEvents: "none", transition: "stroke 0.2s" }}
              />
              <circle
                cx={GAUTENG_CALLOUT.lineX2}
                cy={GAUTENG_CALLOUT.lineY2 - 4}
                r="2"
                fill={hovered === "gauteng" ? "#f59e0b" : "rgba(255,255,255,0.55)"}
                style={{ pointerEvents: "none" }}
              />
              <text
                x={GAUTENG_CALLOUT.textX}
                y={GAUTENG_CALLOUT.textY + 10}
                textAnchor="middle"
                fontSize="9"
                fontWeight="700"
                fill={hovered === "gauteng" ? "#f59e0b" : "rgba(255,255,255,0.85)"}
                style={{
                  pointerEvents: "none",
                  fontFamily: "sans-serif",
                  letterSpacing: "0.3px",
                  transition: "fill 0.2s"
                }}
              >
                GAUTENG
              </text>

              {hoveredProvince && (
                <g
                  transform={`translate(${Math.min(tooltipPos.x + 12, 640)}, ${Math.max(tooltipPos.y - 70, 10)})`}
                  style={{ pointerEvents: "none" }}
                >
                  <rect
                    x="0" y="0" width="168" height="62"
                    rx="8"
                    fill="#001c37"
                    stroke="#f59e0b"
                    strokeWidth="1.5"
                    opacity="0.97"
                  />
                  <text x="12" y="22" fontSize="12" fontWeight="700" fill="#f59e0b" fontFamily="sans-serif">
                    {hoveredProvince.name}
                  </text>
                  <text x="12" y="38" fontSize="10" fill="rgba(255,255,255,0.75)" fontFamily="sans-serif">
                    Capital: {hoveredProvince.capital}
                  </text>
                  <text x="12" y="53" fontSize="10" fill="rgba(255,255,255,0.65)" fontFamily="sans-serif">
                    {hoveredProvince.opportunities} opportunities available
                  </text>
                </g>
              )}
            </svg>

            <section className="flex items-center gap-4 mt-3 px-2 relative z-10">
              <section className="flex items-center gap-2">
                <section className="w-3 h-3 rounded-sm bg-[rgba(0,120,200,0.45)] border border-white/35" />
                <p className="text-xs text-white/60">Province</p>
              </section>
              <section className="flex items-center gap-2">
                <section className="w-3 h-3 rounded-sm bg-[#f59e0b]" />
                <p className="text-xs text-white/60">Hovered province</p>
              </section>
            </section>
          </section>

          {/* Province Stats Panel */}
          <aside className="lg:w-72 flex flex-col gap-3">
            <article className="bg-[#004377] text-white rounded-xl px-5 py-4">
              <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Total Opportunities</p>
              <p className="text-3xl font-extrabold text-[#f59e0b]">
                {PROVINCES.reduce((a, p) => a + p.opportunities, 0)}+
              </p>
              <p className="text-xs opacity-60 mt-1">across all 9 provinces</p>
            </article>

            <section className="flex-1 overflow-y-auto space-y-1.5 pr-0.5" style={{ maxHeight: 460 }}>
              {[...PROVINCES].sort((a, b) => b.opportunities - a.opportunities).map((province) => {
                const isActive = hovered === province.id;
                const maxOpps = Math.max(...PROVINCES.map(p => p.opportunities));
                const pct = Math.round((province.opportunities / maxOpps) * 100);
                return (
                  <button
                    key={province.id}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#f59e0b]/10 border-[#f59e0b] shadow-sm"
                        : "bg-white border-gray-100 hover:border-[#004377]/30 hover:bg-blue-50/40"
                    }`}
                    onMouseEnter={() => setHovered(province.id)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => navigate("/opportunities")}
                  >
                    <section className="flex items-center justify-between mb-1.5">
                      <p className={`text-sm font-semibold ${isActive ? "text-[#f59e0b]" : "text-[#004377]"}`}>
                        {province.name}
                      </p>
                      <p className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive ? "bg-[#f59e0b] text-white" : "bg-[#d2e4ff] text-[#004377]"
                      }`}>
                        {province.opportunities}
                      </p>
                    </section>
                    <section className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <section
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background: isActive ? "#f59e0b" : "#004377",
                          opacity: isActive ? 1 : 0.5
                        }}
                      />
                    </section>
                  </button>
                );
              })}
            </section>

            <button
              onClick={() => navigate("/opportunities")}
              className="w-full py-3 rounded-xl bg-[#f59e0b] text-white text-sm font-bold hover:brightness-110 transition-all hover:scale-[1.02] shadow-md"
            >
              Browse All Opportunities →
            </button>
          </aside>
        </section>

        <p className="text-center text-gray-400 text-xs mt-6">
          Click any province on the map or in the list to explore available learnerships
        </p>
      </section>
    </section>
  );
}