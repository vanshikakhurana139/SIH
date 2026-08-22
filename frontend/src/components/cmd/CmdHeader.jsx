import { useState, useEffect } from "react";
import logoImg from "../../assets/logo.png";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="font-mono text-xs sm:text-sm font-bold text-slate-700 tabular-nums">
      {now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })} {now.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }).toUpperCase()}
    </span>
  );
}

export default function CmdHeader({ scenario, onSwitchScenario, onOpenOperator, activeIncident, activeShiftOperator }) {
  const isTriggered = activeIncident && (activeIncident.status === "diagnosed" || activeIncident.status === "pending_approval");
  const sev = activeIncident?.severity || "critical";
  const sevColor = {
    critical: "#B84040",
    high: "#C0562A",
    medium: "#B07B2E",
    low: "#2D6A9E",
  }[sev] || "#B84040";

  return (
    <header className="header-glass flex items-center justify-between px-6 sm:px-8 py-4 shrink-0 z-20 border-b border-slate-200/80 bg-white/95">
      {/* Left */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <img
            src={logoImg}
            alt="Sentinel Logo"
            className="w-10 h-10 rounded-2xl shrink-0 shadow-sm object-contain bg-white"
          />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-900 leading-tight">Autonomous Incident Orchestration</p>
            <p className="text-[11px] uppercase tracking-[0.14em] font-extrabold text-amber-700">Command Center</p>
          </div>
        </div>

        <div className="hidden md:block w-px h-9 bg-slate-200" />

        {/* Scenario toggle */}
        <div className="flex items-center bg-slate-100/90 rounded-2xl p-1 gap-1 border border-slate-200/80 shadow-2xs">
          {[
            { id: "powerplant", label: "⚡ Power Plant" },
            { id: "hospital",   label: "🏥 Hospital ICU" },
          ].map(({ id, label }) => {
            const active = scenario === id;
            return (
              <button
                key={id}
                id={`scenario-${id}`}
                onClick={() => onSwitchScenario(id)}
                className="px-4 sm:px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer"
                style={active
                  ? { background: "linear-gradient(135deg,#B8963E,#D4AF70)", color: "#fff", boxShadow: "0 3px 10px rgba(184,150,62,0.35)" }
                  : { color: "#475569" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5">
        {/* System status pill (Dynamic) */}
        {isTriggered ? (
          <div
            className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border shadow-2xs animate-pulse"
            style={{
              backgroundColor: `${sevColor}12`,
              borderColor: `${sevColor}40`,
              color: sevColor,
            }}
          >
            <span
              className="live-dot flex-shrink-0 animate-critical"
              style={{
                backgroundColor: sevColor,
                width: 9,
                height: 9,
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            <span className="text-xs font-black font-mono tracking-wider">
              {sev.toUpperCase()} ANOMALY DETECTED
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <span
              className="live-dot flex-shrink-0"
              style={{
                backgroundColor: "#2D7A5A",
                width: 9,
                height: 9,
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            <span className="text-xs font-extrabold font-mono tracking-wider">
              SYSTEM NOMINAL
            </span>
          </div>
        )}

        <div className="hidden sm:block w-px h-8 bg-slate-200" />

        <Clock />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOperator}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border border-amber-300/80 bg-amber-50/60 hover:bg-amber-100/80 transition-all shadow-2xs cursor-pointer group"
            title="Switch Shift Operator / Manage Rules"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-extrabold group-hover:scale-105 transition-transform" style={{ background: "linear-gradient(135deg,#B8963E,#D4AF70)" }}>
              {activeShiftOperator ? activeShiftOperator.split(" ").map(n => n[0]).join("") : "OP"}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-extrabold text-slate-800 leading-none">{activeShiftOperator || "Operator"}</span>
              <span className="text-[9px] font-bold text-amber-800 tracking-wider uppercase mt-0.5">On Duty</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 border border-amber-300 ml-1">Backend</span>
          </button>
        </div>
      </div>
    </header>
  );
}

