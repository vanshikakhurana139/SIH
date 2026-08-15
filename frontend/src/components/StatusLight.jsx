// Dot-and-label convention borrowed from control-room status panels,
// used everywhere a severity or lifecycle state needs signalling instead
// of a solid-fill badge. Quieter, and it scales to a table row without
// competing for attention.

const SEVERITY_COLOR = {
  critical: "var(--color-severity-critical)",
  high: "var(--color-severity-high)",
  medium: "var(--color-severity-medium)",
  low: "var(--color-severity-low)",
};

export function SeverityLight({ severity, className = "" }) {
  const color = SEVERITY_COLOR[severity] || "var(--color-fg-subtle)";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
      />
      <span
        className="text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color }}
      >
        {severity}
      </span>
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
};

export function StatusLight({ status, className = "" }) {
  const color = STATUS_COLOR[status] || "var(--color-fg-subtle)";
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      <span
        className="text-[11px] font-medium uppercase tracking-[0.08em]"
        style={{ color }}
      >
        {status.replace(/_/g, " ")}
      </span>
    </span>
  );
}