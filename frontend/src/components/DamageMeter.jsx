import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

const SEVERITY_RATE = { low: 5, medium: 20, high: 60, critical: 150 };

export default function DamageMeter({ incident }) {
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [prevIncidentId, setPrevIncidentId] = useState(incident?.id);
  const intervalRef = useRef(null);

  if (incident?.id !== prevIncidentId) {
    setPrevIncidentId(incident?.id);
    setHistory([]);
    setElapsed(0);
  }

  useEffect(() => {
    if (!incident) return;
    const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";

    if (!isActive) {
      clearInterval(intervalRef.current);
      return;
    }

    const start = new Date(incident.triggered_at).getTime();
    const rate = SEVERITY_RATE[incident.severity] || 10;

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      setElapsed(secs);
      setHistory((h) => [...h, { t: secs, cost: secs * rate }].slice(-30));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [incident]);

  if (!incident) return null;

  const rate = SEVERITY_RATE[incident.severity] || 10;
  const cost = elapsed * rate;
  const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
  const chartData = history.length ? history : [{ t: 0, cost: 0 }];

  return (
    <div className="dash-card p-5 relative overflow-hidden">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10.5px] uppercase tracking-widest text-fg-subtle font-extrabold">
          Damage Meter <span className="font-mono text-[9px] text-fg-subtle">(ESTIMATED)</span>
        </p>
        <span
          className={`text-[9.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border shadow-2xs ${
            isActive ? "bg-red-500/10 text-red-600 border-red-500/30 animate-pulse" : "bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
          }`}
        >
          {isActive ? "⚡ CLIMBING" : "STOPPED"}
        </span>
      </div>

      <p className="font-display font-black text-3xl text-gradient-danger tabular-nums mb-2 tracking-tight">
        ${cost.toLocaleString()}
      </p>

      <div className="h-16 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="damageFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C92A2A" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#C92A2A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="#C92A2A"
              strokeWidth={2.5}
              fill="url(#damageFill)"
              isAnimationActive={false}
              style={{ filter: "drop-shadow(0 2px 6px rgba(201,42,42,0.3))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-1 text-[11px] font-semibold text-fg-subtle">
        <span>{isActive ? `${elapsed}s unresolved` : "No active delay"}</span>
        <span className="font-mono text-red-600">${rate}/sec</span>
      </div>
    </div>
  );
}