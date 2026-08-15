function StatCard({ label, value, unit, accentVar }) {
  return (
    <div className="relative bg-surface border border-border-subtle rounded-md px-4 py-3.5 flex-1 min-w-[160px] overflow-hidden">
      <span className="absolute top-0 left-0 right-0 h-[2px]" style={{ backgroundColor: accentVar }} />
      <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle">{label}</p>
      <p className="mt-1.5 font-mono text-2xl font-medium text-fg tabular-nums">
        {value}
        {unit && <span className="text-sm text-fg-muted ml-0.5">{unit}</span>}
      </p>
    </div>
  );
}

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex gap-3 flex-wrap mb-6">
      <StatCard label="Active Incidents" value={stats.activeIncidents} accentVar="var(--color-severity-high)" />
      <StatCard label="Resolved Today" value={stats.resolvedToday} accentVar="var(--color-positive)" />
      <StatCard label="Avg. Confidence" value={stats.avgConfidence} unit="%" accentVar="var(--color-accent)" />
      <StatCard label="Auto-Pilot Types" value={stats.autoPilotEnabled} accentVar="var(--color-severity-low)" />
    </div>
  );
}