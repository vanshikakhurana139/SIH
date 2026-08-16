const SEVERITY_COLOR = {
  critical: "var(--color-severity-critical)",
  high: "var(--color-severity-high)",
  medium: "var(--color-severity-medium)",
  low: "var(--color-severity-low)",
};

export function SeverityLight({ severity, className = "" }) {
  const color = SEVERITY_COLOR[severity] || "var(--color-fg-subtle)";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.04em] ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      {severity}
    </span>
  );
}

const STATUS_COLOR = {
  pending_rule_match: "var(--color-fg-subtle)",
  diagnosed: "var(--color-fg-subtle)",
  pending_approval: "var(--color-severity-medium)",
  approved: "var(--color-positive)",
  modified: "var(--color-accent)",
  rejected: "var(--color-severity-critical)",
  executed: "var(--color-accent)",
  resolved: "var(--color-positive)",
  failed: "var(--color-severity-critical)",
  undone: "var(--color-fg-subtle)",
};

export function StatusLight({ status, className = "" }) {
  const color = STATUS_COLOR[status] || "var(--color-fg-subtle)";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-[0.04em] ${className}`}
      style={{ backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}
