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
    <div className="bg-surface border border-border-subtle rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">
          Damage Meter
        </p>
        <span
          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
            isActive ? "bg-severity-critical/10 text-severity-critical" : "bg-fg-subtle/10 text-fg-subtle"
          }`}
        >
          {isActive ? "Climbing" : "Stopped"}
        </span>
      </div>

      <p className="font-display font-extrabold text-3xl text-fg tabular-nums mb-2">
        ${cost.toLocaleString()}
      </p>

      <div className="h-16 -mx-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="damageFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-severity-critical)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-severity-critical)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["auto", "auto"]} />
            <Area
              type="monotone"
              dataKey="cost"
              stroke="var(--color-severity-critical)"
              strokeWidth={2}
              fill="url(#damageFill)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="text-[11px] text-fg-subtle mt-1">
        {isActive ? `${elapsed}s unresolved` : "No active delay"}
      </p>
    </div>
  );
}