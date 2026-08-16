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
    <div className="status-panel p-6 w-[280px]">
      <p className="eyebrow mb-4">Live System Status</p>
      <div className="flex items-center gap-2 mb-5">
        <span className="live-dot bg-emerald-500 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "#2D7A5A" }} />
        <span className="text-[14px] font-semibold text-fg">All Systems Normal</span>
      </div>

      <div className="space-y-3">
        {[
          { label: "Active Incidents", value: stats?.activeIncidents ?? "—", color: "#B84040" },
          { label: "Incidents Resolved Today", value: stats?.resolvedToday ?? "—", color: "#2D7A5A" },
          { label: "Mean Time to Detect", value: "2m 14s", color: null },
          { label: "Mean Time to Respond", value: "8m 37s", color: null },
          { label: "Auto-pilot Actions", value: stats?.autoPilotEnabled ?? "—", color: null },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[12px] text-fg-subtle">{row.label}</span>
            <span
              className="text-[13px] font-bold font-mono"
              style={{ color: row.color || "var(--color-fg)" }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle">
        <p className="text-[10px] uppercase tracking-widest text-fg-subtle font-bold mb-2">System Health</p>
        <div className="flex items-end gap-3">
          <span className="font-display text-4xl font-bold text-fg">{stats?.avgConfidence ?? 96}%</span>
          <div className="pb-1">
            <div className="w-28 h-1 bg-border-subtle rounded-full overflow-hidden mb-1">
              <div
                className="h-full rounded-full bg-gradient-to-r"
                style={{
                  width: `${stats?.avgConfidence ?? 96}%`,
                  background: "linear-gradient(90deg,#2D7A5A,#3DA870)"
                }}
              />
            </div>
            <span className="text-[11px] font-semibold text-positive">Excellent</span>
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
      className="hero-section"
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
      <div className="hero-photo-overlay" />

      {/* 3D layer */}
      <div
        ref={layerRef}
        className="hero-3d-layer"
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
      <div className="relative z-10 max-w-[1400px] mx-auto px-8 w-full pt-20 flex items-center justify-between gap-12">
        <div className="max-w-[520px]">
          <p className="eyebrow hero-text-1 mb-4">From Signal to Action</p>
          <h1 className="font-display text-[54px] leading-[1.06] text-fg hero-text-2" style={{ letterSpacing: "-0.01em" }}>
            Intelligence that<br />
            turns signals into<br />
            decisions that<br />
            <span className="text-gradient-gold">save what matters.</span>
          </h1>
          <p className="text-[15px] text-fg-muted leading-relaxed mt-5 mb-8 max-w-[400px] hero-text-3">
            Detect anomalies. Understand the context. Recommend the right actions. Verify outcomes. All in one intelligent command center.
          </p>
          <div className="flex items-center gap-4 hero-text-4">
            <button
              onClick={onEnterCommandCenter}
              className="gold-btn px-7 py-3.5 text-[13px] font-bold tracking-wide flex items-center gap-2"
              id="hero-enter-btn"
            >
              Explore the Experience
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10M8 3l5 5-5 5" />
              </svg>
            </button>
            <button className="flex items-center gap-2.5 text-[13px] font-medium text-fg-muted hover:text-fg transition-colors">
              <span className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-[12px]">▶</span>
              Watch Overview
            </button>
          </div>

          {/* Scroll hint */}
          <div className="mt-12 hero-text-5">
            <p className="text-[10px] font-mono uppercase tracking-[0.15em] text-fg-subtle flex items-center gap-2 animate-bounce-down">
              <span>Scroll to explore</span>
              <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2 4l4 4 4-4" />
              </svg>
            </p>
          </div>
        </div>

        {/* Status panel — right */}
        <div className="hidden xl:block shrink-0" style={{ animation: "slide-in-right 0.7s 0.5s ease both" }}>
          <StatusPanel stats={stats} />
        </div>
      </div>
    </section>
  );
}
