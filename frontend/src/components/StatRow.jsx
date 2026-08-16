import { IconDoc, IconAlertTriangle, IconCheckCircle } from "../icons";

function Sparkline() {
  // Decorative trend line, matching the mockup's incident-id card.
  return (
    <svg viewBox="0 0 140 44" className="w-full h-11" preserveAspectRatio="none">
      <polyline
        points="0,30 14,26 28,32 42,14 56,20 70,10 84,18 98,6 112,16 126,8 140,14"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.85"
      />
    </svg>
  );
}

function Chip({ tone, children }) {
  const map = {
    neutral: { bg: "var(--color-surface-raised)", fg: "var(--color-fg-muted)" },
    amber: { bg: "color-mix(in srgb, var(--color-severity-high) 14%, transparent)", fg: "var(--color-severity-high)" },
    red: { bg: "color-mix(in srgb, var(--color-severity-critical) 14%, transparent)", fg: "var(--color-severity-critical)" },
    green: { bg: "color-mix(in srgb, var(--color-positive) 14%, transparent)", fg: "var(--color-positive)" },
  };
  const c = map[tone];
  return (
    <span
      className="flex items-center justify-center w-8 h-8 rounded-full shrink-0"
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {children}
    </span>
  );
}

export default function StatRow({ activeIncident, incidents, stats }) {
  const list = incidents || [];
  const tier2Count = list.filter(
    (i) => (i.severity === "medium" || i.severity === "high") && !["resolved", "rejected", "undone"].includes(i.status)
  ).length;
  const criticalCount = list.filter((i) => i.severity === "critical").length;
  const backlog = list.length;
  const resolved = stats?.resolvedToday ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 px-8 mb-6">
      <div className="dash-card px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="dash-eyebrow">Incident ID</p>
          <IconDoc width={14} height={14} className="text-fg-subtle" />
        </div>
        <p className="font-display text-3xl font-extrabold text-fg tabular-nums">
          {activeIncident ? `#${activeIncident.id.slice(0, 5)}` : "—"}
        </p>
        <div className="mt-1">
          <Sparkline />
        </div>
        <p className="text-[10.5px] font-mono text-fg-subtle mt-1">
          {activeIncident
            ? new Date(activeIncident.triggered_at).toLocaleString()
            : "No active incident"}
        </p>
      </div>

      <div className="dash-card px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="dash-eyebrow">White</p>
          <Chip tone="neutral">
            <IconDoc width={14} height={14} />
          </Chip>
        </div>
        <p className="font-display text-3xl font-extrabold text-fg tabular-nums">{backlog}</p>
        <p className="text-[11px] text-fg-subtle mt-1 font-semibold uppercase tracking-[0.04em]">
          Incident Backlog
        </p>
      </div>

      <div className="dash-card px-5 py-4 border-t-2" style={{ borderTopColor: "var(--color-severity-high)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="dash-eyebrow" style={{ color: "var(--color-severity-high)" }}>
            Red
          </p>
          <Chip tone="amber">
            <IconAlertTriangle width={14} height={14} />
          </Chip>
        </div>
        <p className="font-display text-3xl font-extrabold text-fg tabular-nums">{tier2Count}</p>
        <p className="text-[11px] mt-1 font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--color-severity-high)" }}>
          Tier 2 Alerts
        </p>
      </div>

      <div className="dash-card px-5 py-4 border-t-2" style={{ borderTopColor: "var(--color-severity-critical)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="dash-eyebrow" style={{ color: "var(--color-severity-critical)" }}>
            Red
          </p>
          <Chip tone="red">
            <IconAlertTriangle width={14} height={14} />
          </Chip>
        </div>
        <p className="font-display text-3xl font-extrabold text-fg tabular-nums">{criticalCount}</p>
        <p className="text-[11px] mt-1 font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--color-severity-critical)" }}>
          Critical Severity
        </p>
      </div>

      <div className="dash-card px-5 py-4 border-t-2" style={{ borderTopColor: "var(--color-positive)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="dash-eyebrow" style={{ color: "var(--color-positive)" }}>
            Green
          </p>
          <Chip tone="green">
            <IconCheckCircle width={14} height={14} />
          </Chip>
        </div>
        <p className="font-display text-3xl font-extrabold text-fg tabular-nums">{resolved}</p>
        <p className="text-[11px] mt-1 font-semibold uppercase tracking-[0.04em]" style={{ color: "var(--color-positive)" }}>
          Resolved / Nominal
        </p>
      </div>
    </div>
  );
}
