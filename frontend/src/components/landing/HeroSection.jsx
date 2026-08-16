import { useRef, useEffect, useState } from "react";

// Power plant image from Unsplash
const PLANT_IMAGE = "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1800&q=80&fit=crop";

// SVG Isometric 3D infrastructure overlay
function Infrastructure3D({ activeNode, onHover }) {
  return (
    <svg
      viewBox="0 0 600 400"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 4px 24px rgba(184,150,62,0.15))" }}
    >
      {/* Signal paths — animated dashes */}
      <g stroke="rgba(184,150,62,0.5)" strokeWidth="1.2" fill="none">
        <line x1="140" y1="180" x2="240" y2="140" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.2s" repeatCount="indefinite" />
        </line>
        <line x1="240" y1="140" x2="340" y2="160" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1s" repeatCount="indefinite" />
        </line>
        <line x1="340" y1="160" x2="430" y2="130" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.4s" repeatCount="indefinite" />
        </line>
        <line x1="240" y1="140" x2="210" y2="240" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.6s" repeatCount="indefinite" />
        </line>
        <line x1="340" y1="160" x2="360" y2="250" strokeDasharray="4 4">
          <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.3s" repeatCount="indefinite" />
        </line>
      </g>

      {/* Turbine 03 — main highlighted node */}
      <g
        transform="translate(316, 138)"
        style={{ cursor: "pointer" }}
        onMouseEnter={() => onHover("turbine")}
        onMouseLeave={() => onHover(null)}
      >
        {/* Outer ring — animated */}
        <circle r="26" fill="rgba(184,150,62,0.10)" stroke="rgba(184,150,62,0.60)" strokeWidth="1.5">
          <animate attributeName="r" values="26;30;26" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.6;1" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Inner node */}
        <circle r="16" fill="rgba(184,150,62,0.20)" stroke="rgba(184,150,62,0.80)" strokeWidth="1.5" />
        {/* Icon */}
        <text x="0" y="4" textAnchor="middle" fontSize="14" fill="#B8963E">⚙</text>
      </g>

      {/* Generator */}
      <g transform="translate(140, 158)" style={{ cursor: "pointer" }}
        onMouseEnter={() => onHover("generator")} onMouseLeave={() => onHover(null)}>
        <circle r="13" fill="rgba(255,255,255,0.70)" stroke="rgba(180,160,120,0.50)" strokeWidth="1.2" />
        <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#9A8F84">⚡</text>
      </g>

      {/* Coolant */}
      <g transform="translate(430, 108)" style={{ cursor: "pointer" }}
        onMouseEnter={() => onHover("coolant")} onMouseLeave={() => onHover(null)}>
        <circle r="13" fill="rgba(255,255,255,0.70)" stroke="rgba(180,160,120,0.50)" strokeWidth="1.2" />
        <text x="0" y="4" textAnchor="middle" fontSize="11" fill="#9A8F84">🌡</text>
      </g>

      {/* Substation */}
      <g transform="translate(210, 228)">
        <rect x="-12" y="-10" width="24" height="20" rx="4" fill="rgba(255,255,255,0.60)" stroke="rgba(180,160,120,0.40)" strokeWidth="1" />
        <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#9A8F84">⊕</text>
      </g>

      {/* Grid */}
      <g transform="translate(360, 240)">
        <rect x="-12" y="-10" width="24" height="20" rx="4" fill="rgba(255,255,255,0.60)" stroke="rgba(180,160,120,0.40)" strokeWidth="1" />
        <text x="0" y="4" textAnchor="middle" fontSize="10" fill="#9A8F84">◈</text>
      </g>

      {/* Vibration sensor label */}
      {activeNode === "turbine" && (
        <g transform="translate(260, 95)">
          <rect x="-50" y="-18" width="100" height="36" rx="8" fill="rgba(255,255,255,0.97)" stroke="rgba(184,150,62,0.35)" strokeWidth="1" />
          <text x="0" y="-4" textAnchor="middle" fontSize="9" fill="#9A8F84" fontWeight="700" fontFamily="monospace">TURBINE 03 • LIVE</text>
          <text x="0" y="10" textAnchor="middle" fontSize="11" fill="#1A1612" fontWeight="700">Vibration 2.4 mm/s</text>
        </g>
      )}
    </svg>
  );
}

function StatusPanel({ stats }) {
  return (
    <div className="ivory-card p-7 sm:p-8 w-[320px] rounded-3xl border border-slate-200 shadow-lg bg-white/95 backdrop-blur-md">
      <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-300">
        Live System Status
      </span>
      <div className="flex items-center gap-2.5 my-4">
        <span className="live-dot bg-emerald-600 w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: "#15803D" }} />
        <span className="text-base font-black text-slate-900">All Systems Nominal</span>
      </div>

      <div className="space-y-3.5">
        {[
          { label: "Active Incidents", value: stats?.activeIncidents ?? "0", color: "#B91C1C" },
          { label: "Resolved Today", value: stats?.resolvedToday ?? "42", color: "#15803D" },
          { label: "Mean Time to Detect", value: "2m 14s", color: null },
          { label: "Mean Time to Respond", value: "8m 37s", color: null },
          { label: "Auto-pilot Actions", value: stats?.autoPilotEnabled ?? "18", color: null },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-600">{row.label}</span>
            <span
              className="font-sans text-sm font-black tabular-nums"
              style={{ color: row.color || "#0F172A" }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-slate-200">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-black mb-2">System Stability Score</p>
        <div className="flex items-end gap-3">
          <span className="font-sans text-4xl font-black text-slate-900 leading-none">{stats?.avgConfidence ?? 96}%</span>
          <div className="pb-1 flex-1">
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${stats?.avgConfidence ?? 96}%`,
                  background: "linear-gradient(90deg,#15803D,#22C55E)"
                }}
              />
            </div>
            <span className="text-xs font-black text-emerald-900">● 99.8% Nominal</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HeroSection({ stats, onEnterCommandCenter }) {
  const containerRef = useRef(null);
  const photoRef = useRef(null);
  const layerRef = useRef(null);
  const [activeNode, setActiveNode] = useState(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      if (photoRef.current) {
        photoRef.current.style.transform = `scale(1.05) translate(${x * -12}px, ${y * -8}px)`;
      }
      if (layerRef.current) {
        layerRef.current.style.transform = `translate(${x * 18}px, ${y * 12}px)`;
      }
    }

    el.addEventListener("mousemove", handleMove);
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  return (
    <section
      ref={containerRef}
      className="hero-section relative overflow-hidden"
      id="hero"
      style={{ minHeight: "100vh" }}
    >
      {/* Background photo */}
      <div
        ref={photoRef}
        className="hero-photo"
        style={{
          backgroundImage: `url("${PLANT_IMAGE}")`,
          transition: "transform 0.1s ease-out",
        }}
      />
      <div className="hero-photo-overlay bg-gradient-to-r from-white via-white/80 to-transparent" />

      {/* 3D layer */}
      <div
        ref={layerRef}
        className="hero-3d-layer pointer-events-none"
        style={{
          transition: "transform 0.15s ease-out",
          right: "10%",
          left: "35%",
          top: "15%",
          bottom: "15%",
        }}
      >
        <Infrastructure3D activeNode={activeNode} onHover={setActiveNode} />
      </div>

      {/* Hero content — left */}
      <div className="relative z-10 max-w-[1700px] mx-auto px-8 w-full pt-28 pb-16 flex items-center justify-between gap-12">
        <div className="max-w-[620px]">
          <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            From Sensor Signal to Autonomous Action
          </span>
          <h1 className="font-sans text-5xl sm:text-6xl font-black text-slate-900 leading-[1.08] tracking-tight mt-4">
            Autonomous AI platform that turns signals into <span className="text-gradient-gold">flawless execution.</span>
          </h1>
          <p className="text-base sm:text-lg font-bold text-slate-700 leading-relaxed mt-6 mb-8 max-w-xl">
            Detect sensor anomalies. Understand diagnostic context. Recommend deterministic action. Verify system recovery.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={onEnterCommandCenter}
              className="gold-btn px-8 py-4 rounded-2xl text-xs font-black tracking-wider flex items-center gap-3 shadow-md"
              id="hero-enter-btn"
            >
              Launch Command Center
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 8h10M8 3l5 5-5 5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Status panel — right */}
        <div className="hidden xl:block shrink-0">
          <StatusPanel stats={stats} />
        </div>
      </div>
    </section>
  );
}
