import { useState, useEffect } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-[12px] font-semibold text-fg-muted tabular-nums">
      {now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })} {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()}
    </span>
  );
}

export default function CmdHeader({ scenario, onSwitchScenario }) {
  return (
    <header className="header-glass flex items-center justify-between px-6 py-3 shrink-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-[13px] shrink-0"
            style={{ background: "linear-gradient(135deg,#B8963E,#D4AF70)", boxShadow: "0 2px 8px rgba(184,150,62,0.30)" }}
          >
            S
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-fg leading-tight">AI Incident Orchestration</p>
            <p className="text-[9px] uppercase tracking-[0.12em] font-bold text-gold" style={{ color: "var(--color-gold)" }}>Command Center</p>
          </div>
        </div>

        <div className="w-px h-8 bg-border-subtle" />

        {/* Scenario toggle */}
        <div className="flex items-center bg-white/60 rounded-xl p-1 gap-0.5 border border-border-subtle shadow-sm">
          {[
            { id: "powerplant", label: "Power Plant" },
            { id: "hospital",   label: "Hospital" },
          ].map(({ id, label }) => {
            const active = scenario === id;
            return (
              <button
                key={id}
                id={`scenario-${id}`}
                onClick={() => onSwitchScenario(id)}
                className="px-4 py-1.5 rounded-[10px] text-[11px] font-bold uppercase tracking-wider transition-all duration-200"
                style={active
                  ? { background: "linear-gradient(135deg,#B8963E,#D4AF70)", color: "#fff", boxShadow: "0 2px 8px rgba(184,150,62,0.30)" }
                  : { color: "var(--color-fg-muted)" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* System status */}
        <div className="flex items-center gap-2">
          <span className="live-dot flex-shrink-0" style={{ backgroundColor: "#2D7A5A", width: 8, height: 8, borderRadius: "50%", display: "inline-block" }} />
          <span className="text-[11px] font-bold text-fg font-mono">SYSTEM NOMINAL</span>
        </div>

        <div className="w-px h-7 bg-border-subtle" />

        <Clock />

        <div className="w-px h-7 bg-border-subtle" />

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button className="relative flex items-center justify-center w-8 h-8 rounded-xl border border-border-subtle bg-white/70 hover:bg-white transition-all text-fg-muted hover:text-fg">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold border border-white" style={{ backgroundColor: "#B8963E" }} />
          </button>
          <button className="flex items-center justify-center w-8 h-8 rounded-xl border border-border-subtle bg-white/70 hover:bg-white transition-all text-fg-muted hover:text-fg text-[12px] font-bold">
            ?
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border-subtle bg-white/70 hover:bg-white transition-all">
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: "linear-gradient(135deg,#B8963E,#D4AF70)" }}>A</div>
            <span className="text-[12px] font-semibold text-fg-muted">Operator</span>
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-fg-subtle">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
