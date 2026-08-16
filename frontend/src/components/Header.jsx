import { useState, useEffect } from "react";
import { IconBell } from "../icons";

function Clock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  return (
    <div className="text-right">
      <p className="font-mono text-[15px] font-bold text-fg tracking-wide tabular-nums">{time} <span className="text-fg-subtle text-[11px]">UTC</span></p>
      <p className="text-[10px] text-fg-subtle font-mono tracking-widest">{date}</p>
    </div>
  );
}

export default function Header({ scenario, onSwitchScenario }) {
  return (
    <header className="header-glass flex items-center justify-between px-6 py-4 shrink-0 z-10">
      {/* Left: Brand + tabs */}
      <div className="flex items-center gap-6">
        <div>
          <h1 className="font-display text-[13px] font-extrabold text-fg tracking-widest leading-tight uppercase">
            AI Incident Orchestration
          </h1>
          <p className="text-[9.5px] uppercase tracking-[0.18em] font-bold mt-0.5"
             style={{ background: "linear-gradient(90deg,#3B5BDB,#748FFC)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Command Center
          </p>
        </div>

        {/* Scenario toggle */}
        <div className="flex items-center bg-white/50 rounded-xl p-1 gap-0.5 border border-white/70 shadow-sm">
          {["hospital", "powerplant"].map((s) => {
            const active = scenario === s;
            return (
              <button
                key={s}
                onClick={() => onSwitchScenario(s)}
                className={`px-4 py-1.5 rounded-[10px] text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "text-white shadow-md"
                    : "text-fg-muted hover:text-fg"
                }`}
                style={active ? {
                  background: "linear-gradient(135deg, #3B5BDB, #748FFC)",
                  boxShadow: "0 2px 8px rgba(59,91,219,0.35)"
                } : {}}
              >
                {s === "hospital" ? "🏥 Hospital" : "⚡ Power Plant"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Status + time + actions */}
      <div className="flex items-center gap-5">
        {/* System status */}
        <div className="flex items-center gap-2">
          <span className="live-dot bg-emerald-500 flex-shrink-0" style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#087F5B" }} />
          <div>
            <p className="text-[9px] font-bold text-fg-subtle uppercase tracking-wider">System Status</p>
            <p className="text-[11px] font-bold text-fg font-mono leading-tight">ALL NOMINAL</p>
          </div>
        </div>

        <div className="w-px h-9 bg-gradient-to-b from-transparent via-border to-transparent" />

        <Clock />

        <div className="w-px h-9 bg-gradient-to-b from-transparent via-border to-transparent" />

        {/* Action icons */}
        <div className="flex items-center gap-2">
          <button
            className="relative flex items-center justify-center w-9 h-9 rounded-xl border border-white/80 bg-white/60 hover:bg-white/90 transition-all shadow-sm text-fg-muted hover:text-accent"
            aria-label="Notifications"
          >
            <IconBell width={15} height={15} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-white" />
          </button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/80 bg-white/60 hover:bg-white/90 transition-all shadow-sm text-fg-muted hover:text-fg font-bold text-[13px]"
            aria-label="Help"
          >?</button>
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/80 bg-gradient-to-br from-accent/10 to-accent-light/10 hover:from-accent/20 hover:to-accent-light/20 transition-all shadow-sm"
            aria-label="Profile"
          >
            <span className="text-[14px]">👤</span>
          </button>
        </div>
      </div>
    </header>
  );
}
