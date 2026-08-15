// Signature readout used wherever a confidence score appears.
// Modeled on an analog signal-strength meter rather than a generic
// rounded progress bar: fixed tick marks give a frame of reference,
// and the numeral renders in the mono face so it lines up with every
// other data point on the page.

const TICKS = [0, 25, 50, 75, 100];

export default function Gauge({ value, size = "md" }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  const height = size === "sm" ? 6 : 8;

  const color =
    pct >= 85
      ? "var(--color-positive)"
      : pct >= 65
      ? "var(--color-accent)"
      : pct >= 40
      ? "var(--color-severity-medium)"
      : "var(--color-severity-critical)";

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
          Confidence
        </span>
        <span className="font-mono text-sm text-fg tabular-nums">
          {pct.toFixed(0)}
          <span className="text-fg-subtle">%</span>
        </span>
      </div>

      <div
        className="relative w-full rounded-[2px] bg-surface-raised border border-border-subtle overflow-hidden"
        style={{ height }}
      >
        <div
          className="h-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          {TICKS.map((t) => (
            <span key={t} className="w-px bg-ink/50" />
          ))}
        </div>
      </div>
    </div>
  );
}