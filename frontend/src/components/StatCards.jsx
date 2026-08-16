import { IconAlertTriangle, IconCheckCircle, IconDial, IconBolt } from "../icons";

const CARD_CONFIG = {
  activeIncidents: { icon: IconAlertTriangle, tint: "var(--color-severity-high)" },
  resolvedToday: { icon: IconCheckCircle, tint: "var(--color-positive)" },
  avgConfidence: { icon: IconDial, tint: "var(--color-accent)" },
  autoPilotEnabled: { icon: IconBolt, tint: "var(--color-severity-low)" },
};

function StatCard({ label, value, unit, configKey }) {
  const { icon: Icon, tint } = CARD_CONFIG[configKey];
  return (
    <div className="relative bg-surface border border-border-subtle rounded-2xl px-5 py-4 flex-1 min-w-[180px] shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{ backgroundColor: `color-mix(in srgb, ${tint} 14%, transparent)`, color: tint }}
        >
          <Icon width={19} height={19} />
        </span>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle font-semibold">{label}</p>
          <p className="mt-0.5 font-display text-2xl font-extrabold text-fg tabular-nums">
            {value}
            {unit && <span className="text-sm text-fg-muted ml-0.5 font-semibold">{unit}</span>}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex gap-3 flex-wrap mb-6">
      <StatCard label="Active Incidents" value={stats.activeIncidents} configKey="activeIncidents" />
      <StatCard label="Resolved Today" value={stats.resolvedToday} configKey="resolvedToday" />
      <StatCard label="Avg. Confidence" value={stats.avgConfidence} unit="%" configKey="avgConfidence" />
      <StatCard label="Auto-Pilot Types" value={stats.autoPilotEnabled} configKey="autoPilotEnabled" />
    </div>
  );
}