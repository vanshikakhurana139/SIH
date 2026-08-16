import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

const SEVERITY_RATE = { low: 5, medium: 20, high: 60, critical: 150 };

export default function IncidentImpact({ incident }) {
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState([]);
  const [prevId, setPrevId] = useState(incident?.id);
  const intervalRef = useRef(null);

  if (incident?.id !== prevId) {
    setPrevId(incident?.id);
    setHistory([]);
    setElapsed(0);
  }

  useEffect(() => {
    if (!incident) return;
    const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
    if (!isActive) { clearInterval(intervalRef.current); return; }

    const start = new Date(incident.triggered_at).getTime();
    const rate = SEVERITY_RATE[incident.severity] || 10;

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      setElapsed(secs);
      setHistory((h) => [...h, { t: secs, cost: secs * rate }].slice(-24));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [incident]);

  if (!incident) return null;

  const rate = SEVERITY_RATE[incident.severity] || 10;
  const cost = elapsed * rate;
  const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
  const chartData = history.length ? history : [{ t: 0, cost: 0 }];

  return (
    <div className="ivory-card p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="dash-eyebrow">Incident Impact</p>
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border"
          style={isActive
            ? { background: "rgba(184,64,64,0.08)", color: "#B84040", borderColor: "rgba(184,64,64,0.22)" }
            : { background: "rgba(45,122,90,0.08)", color: "#2D7A5A", borderColor: "rgba(45,122,90,0.22)" }}
        >
          {isActive ? "⚡ CLIMBING" : "STOPPED"}
        </span>
      </div>

      <p className="text-[32px] font-black font-display text-gradient-danger tabular-nums leading-none my-3">
        ${cost.toLocaleString()}
      </p>
      <p className="text-[11px] text-fg-subtle mb-3">Estimated Exposure</p>

      {/* Sparkline */}
      <div className="h-14 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B84040" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#B84040" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Area type="monotone" dataKey="cost" stroke="#B84040" strokeWidth={2} fill="url(#impactFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px]">
        <span className="text-fg-subtle">{isActive ? `${elapsed}s unresolved` : "Resolved"}</span>
        <span className="font-mono font-bold" style={{ color: "#B84040" }}>+${rate}/sec</span>
      </div>
    </div>
  );
}
