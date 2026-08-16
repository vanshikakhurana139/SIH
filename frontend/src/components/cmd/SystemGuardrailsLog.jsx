import { useState, useEffect } from "react";

const INITIAL_EVENTS = [
  { time: "12:52:14", type: "system", text: "Sensor telemetry baseline validation passed (0.012 σ noise)." },
  { time: "12:51:30", type: "ai", text: "AI Inference Engine evaluated 14 safety constraints — 100% compliant." },
  { time: "12:50:02", type: "health", text: "Automated health cycle verified system stability." },
  { time: "12:48:19", type: "trust", text: "Data source trust matrix re-calibrated (Avg Trust Score: 0.91)." },
  { time: "12:45:00", type: "stream", text: "Zero-latency telemetry stream active @ 1,000 Hz." },
];

export default function SystemGuardrailsLog() {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const start = Date.now() - 1000 * 60 * 60 * 24 * 4; // 4 days ago
    const interval = setInterval(() => {
      setUptime(Date.now() - start);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((uptime / 1000 / 60) % 60);

  return (
    <div className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-2xs">
          AI Guardrails & Audit Stream
        </span>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-300 px-3.5 py-1 rounded-full">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-xs font-black text-emerald-900">GUARDRAILS ACTIVE</span>
        </div>
      </div>

      {/* Cluster Performance & Uptime Bar */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">System Uptime</p>
          <div className="flex items-baseline gap-1.5">
            <span className="font-sans text-2xl font-black text-slate-900 tabular-nums">{days}</span>
            <span className="text-xs font-bold text-slate-600">d</span>
            <span className="font-sans text-2xl font-black text-slate-900 tabular-nums">{String(hours).padStart(2, "0")}</span>
            <span className="text-xs font-bold text-slate-600">h</span>
            <span className="font-sans text-2xl font-black text-slate-900 tabular-nums">{String(minutes).padStart(2, "0")}</span>
            <span className="text-xs font-bold text-slate-600">m</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-1">Cluster Telemetry</p>
          <p className="text-sm font-black text-slate-900 mt-1">CPU 14% • RAM 1.4 GB</p>
          <p className="text-xs font-extrabold text-emerald-800 mt-0.5">● 100% Clusters Nominal</p>
        </div>
      </div>

      {/* Active AI Policy Guardrails Grid */}
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-600 mb-3">
          Safety Interlocks & Policy Rules
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Deterministic Engine", status: "Enabled", color: "#15803D" },
            { label: "Fail-Safe Interlock", status: "Active", color: "#15803D" },
            { label: "Threshold Guardrails", status: "14 Enforced", color: "#15803D" },
            { label: "Human Overrides", status: "0 Pending", color: "#334155" },
          ].map(({ label, status, color }) => (
            <div key={label} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-black uppercase tracking-wider text-slate-500">{label}</p>
              <p className="text-sm font-black mt-0.5" style={{ color }}>{status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Audit Event Trail */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-widest text-slate-600">
            Realtime Audit Log
          </p>
          <span className="text-xs font-black text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">LIVE FEED</span>
        </div>

        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {INITIAL_EVENTS.map((ev, i) => (
            <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="text-xs font-black text-slate-900 shrink-0 mt-0.5 bg-slate-200 px-2 py-0.5 rounded-md">{ev.time}</span>
              <p className="text-xs font-extrabold text-slate-900 leading-snug">{ev.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
