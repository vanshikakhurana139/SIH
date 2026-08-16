import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";

export default function IncidentImpact({ incident, scenario }) {
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
    const isHospital = scenario === "hospital";

    intervalRef.current = setInterval(() => {
      const secs = Math.floor((Date.now() - start) / 1000);
      setElapsed(secs);
      const currentCost = isHospital ? Math.floor(secs / 10) : Math.floor(secs / 5) * 10;
      setHistory((h) => [...h, { t: secs, cost: currentCost }].slice(-24));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [incident, scenario]);

  if (!incident) return null;

  const isHospital = scenario === "hospital";
  const cost = isHospital ? Math.floor(elapsed / 10) : Math.floor(elapsed / 5) * 10;
  const rateLabel = isHospital ? "$1/10s burn" : "$10/5s burn";
  const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
  const chartData = history.length ? history : [{ t: 0, cost: 0 }];

  return (
    <div className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm bg-white/90">
      <div className="flex items-center justify-between mb-4">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-rose-50 text-rose-700 border border-rose-200/80">
          Financial & System Impact
        </span>
        <span
          className="text-xs font-mono font-extrabold px-3 py-1 rounded-full border"
          style={isActive
            ? { background: "rgba(184,64,64,0.08)", color: "#B84040", borderColor: "rgba(184,64,64,0.25)" }
            : { background: "rgba(45,122,90,0.08)", color: "#2D7A5A", borderColor: "rgba(45,122,90,0.25)" }}
        >
          {isActive ? "⚡ ACCUMULATING" : "STABILIZED"}
        </span>
      </div>

      <p className="text-4xl sm:text-5xl font-black font-display text-rose-700 tabular-nums leading-none my-4 tracking-tight">
        ${cost.toLocaleString()}
      </p>
      <p className="text-xs font-bold text-slate-500 mb-4">Estimated Exposure Risk</p>

      {/* Sparkline */}
      <div className="h-20 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="impactFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#B84040" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#B84040" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Area type="monotone" dataKey="cost" stroke="#B84040" strokeWidth={2.5} fill="url(#impactFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between mt-3 text-xs font-bold border-t border-slate-100 pt-3">
        <span className="text-slate-500">{isActive ? `${elapsed}s elapsed` : "Incident resolved"}</span>
        <span className="font-mono text-rose-700">+{rateLabel}</span>
      </div>
    </div>
  );
}
