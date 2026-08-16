// Signature element: a radial arc gauge modeled on an analog instrument
// dial, not a flat progress bar. Fixed tick marks give it the same
// "read at a glance" quality as a real control-room gauge.

const SIZE = { width: 180, height: 112 };
const CENTER = { x: 90, y: 92 };
const RADIUS = 68;
const STROKE = 10;
const ARC_LENGTH = Math.PI * RADIUS;
const TICKS = [0, 25, 50, 75, 100];

function pointOnArc(pct, radius = RADIUS) {
  const angleDeg = 180 - (pct / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;
  return {
    x: CENTER.x + radius * Math.cos(angleRad),
    y: CENTER.y - radius * Math.sin(angleRad),
  };
}

export default function Gauge({ value }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));

  const color =
    pct >= 85
      ? "var(--color-positive)"
      : pct >= 65
      ? "var(--color-accent)"
      : pct >= 40
      ? "var(--color-severity-medium)"
      : "var(--color-severity-critical)";

  const left = pointOnArc(0);
  const right = pointOnArc(100);
  const trackPath = `M ${left.x} ${left.y} A ${RADIUS} ${RADIUS} 0 0 1 ${right.x} ${right.y}`;
  const dashOffset = ARC_LENGTH * (1 - pct / 100);

  return (
    <div className="w-full">
      <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle font-medium mb-1">
        Confidence
      </p>

      <div className="relative flex justify-center">
        <svg width={SIZE.width} height={SIZE.height} viewBox={`0 0 ${SIZE.width} ${SIZE.height}`}>
          <path
            d={trackPath}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />
          <path
            d={trackPath}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.3s ease" }}
          />
          {TICKS.map((t) => {
            const outer = pointOnArc(t, RADIUS + 3);
            const inner = pointOnArc(t, RADIUS - 12);
            return (
              <line
                key={t}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--color-border-strong)"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
        <div className="absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="font-mono text-2xl font-semibold text-fg tabular-nums leading-none">
            {pct.toFixed(0)}
            <span className="text-[13px] text-fg-subtle font-normal">%</span>
          </span>
        </div>
      </div>

      <div className="flex justify-between px-1">
        {TICKS.map((t) => (
          <span key={t} className="text-[9px] font-mono text-fg-subtle">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}