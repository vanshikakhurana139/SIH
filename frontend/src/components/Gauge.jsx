// Premium AI Confidence Gauge with SVG linear gradients, glowing dropshadows, smooth animations, and dynamic status pill

const SIZE = { width: 220, height: 130 };
const CENTER = { x: 110, y: 110 };
const RADIUS = 80;
const STROKE = 12;
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

  let levelLabel;
  let gradientId;
  let glowColor;
  let textColor;

  if (pct >= 85) {
    levelLabel = "VERY HIGH";
    gradientId = "gaugeGreen";
    glowColor = "rgba(8, 127, 91, 0.45)";
    textColor = "#087F5B";
  } else if (pct >= 65) {
    levelLabel = "HIGH";
    gradientId = "gaugeBlue";
    glowColor = "rgba(59, 91, 219, 0.45)";
    textColor = "#3B5BDB";
  } else if (pct >= 40) {
    levelLabel = "MEDIUM";
    gradientId = "gaugeAmber";
    glowColor = "rgba(217, 72, 15, 0.45)";
    textColor = "#C0470A";
  } else {
    levelLabel = "CRITICAL";
    gradientId = "gaugeRed";
    glowColor = "rgba(201, 42, 42, 0.45)";
    textColor = "#C92A2A";
  }

  const left = pointOnArc(0);
  const right = pointOnArc(100);
  const trackPath = `M ${left.x} ${left.y} A ${RADIUS} ${RADIUS} 0 0 1 ${right.x} ${right.y}`;
  const dashOffset = ARC_LENGTH * (1 - pct / 100);
  const needleTip = pointOnArc(pct, RADIUS);

  return (
    <div className="w-full my-2">
      <div className="relative flex flex-col items-center justify-center">
        <svg width={SIZE.width} height={SIZE.height} viewBox={`0 0 ${SIZE.width} ${SIZE.height}`} className="overflow-visible">
          <defs>
            <linearGradient id="gaugeGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#20C997" />
              <stop offset="100%" stopColor="#087F5B" />
            </linearGradient>
            <linearGradient id="gaugeBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#748FFC" />
              <stop offset="100%" stopColor="#3B5BDB" />
            </linearGradient>
            <linearGradient id="gaugeAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFC078" />
              <stop offset="100%" stopColor="#D9480F" />
            </linearGradient>
            <linearGradient id="gaugeRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF8787" />
              <stop offset="100%" stopColor="#C92A2A" />
            </linearGradient>
            <linearGradient id="gaugeLow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#74C0FC" />
              <stop offset="100%" stopColor="#1864AB" />
            </linearGradient>

            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track Background */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(79, 100, 185, 0.12)"
            strokeWidth={STROKE}
            strokeLinecap="round"
          />

          {/* Active Colored Gauge Arc with Glow */}
          <path
            d={trackPath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={ARC_LENGTH}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              filter: `drop-shadow(0 4px 8px ${glowColor})`,
            }}
          />

          {/* Ticks */}
          {TICKS.map((t) => {
            const outer = pointOnArc(t, RADIUS + 5);
            const inner = pointOnArc(t, RADIUS - 10);
            return (
              <line
                key={t}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(79, 100, 185, 0.3)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            );
          })}

          {/* Glowing Needle Head / Tip */}
          <circle
            cx={needleTip.x}
            cy={needleTip.y}
            r="6"
            fill="#FFFFFF"
            stroke={textColor}
            strokeWidth="3"
            style={{
              transition: "cx 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), cy 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: `0 0 10px ${glowColor}`,
            }}
          />
        </svg>

        <div className="absolute inset-x-0 bottom-2 flex flex-col items-center">
          <div className="flex items-baseline gap-0.5">
            <span className="font-display text-3xl font-black text-fg tabular-nums leading-none tracking-tight">
              {pct.toFixed(0)}
            </span>
            <span className="text-sm font-bold text-fg-subtle">%</span>
          </div>
          <span
            className="mt-1 px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border shadow-xs"
            style={{
              backgroundColor: `${textColor}12`,
              color: textColor,
              borderColor: `${textColor}30`,
            }}
          >
            {levelLabel} CONFIDENCE
          </span>
        </div>
      </div>
    </div>
  );
}
