import { IconAlertTriangle, IconCheckCircle, IconDial, IconBolt } from "../icons";

function Sparkline({ color = "#3B5BDB", id = "spark" }) {
  return (
    <svg viewBox="0 0 100 32" className="w-full h-8 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon
        points="0,32 0,22 12,18 25,24 38,10 50,16 62,6 75,14 88,4 100,10 100,32"
        fill={`url(#${id})`}
      />
      <polyline
        points="0,22 12,18 25,24 38,10 50,16 62,6 75,14 88,4 100,10"
        fill="none"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}
      />
    </svg>
  );
}

function StatCard({ label, value, unit, icon: Icon, tint, trend, trendLabel, gradientClass, cardClass, id }) {
  return (
    <div className={`dash-card ${cardClass} p-5 flex-1 min-w-[170px] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]`}>
      {/* Background radial highlight */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-40 pointer-events-none transition-opacity group-hover:opacity-70"
        style={{ background: tint }}
      />

      <div className="flex items-start justify-between mb-3 relative z-10">
        <p className="text-[10.5px] uppercase tracking-widest text-fg-subtle font-extrabold leading-tight">{label}</p>
        <span
          className="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 shadow-xs border border-white/60 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${tint}15`, color: tint }}
        >
          <Icon width={18} height={18} />
        </span>
      </div>

      <div className="relative z-10 mb-1">
        <p className={`font-display text-3xl font-black tabular-nums leading-none tracking-tight ${gradientClass || "text-fg"}`}>
          {value}
          {unit && <span className="text-base text-fg-muted font-bold ml-1">{unit}</span>}
        </p>
      </div>

      {trend && (
        <p className="text-[11px] font-extrabold relative z-10 flex items-center gap-1" style={{ color: trend > 0 ? "#087F5B" : "#C92A2A" }}>
          <span>{trend > 0 ? "▲" : "▼"}</span>
          <span>{Math.abs(trend)} {trendLabel}</span>
        </p>
      )}

      <div className="mt-2 -mx-1 relative z-10">
        <Sparkline color={tint} id={id} />
      </div>
    </div>
  );
}

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="flex gap-4 mb-0 flex-wrap">
      <StatCard
        id="spark1"
        label="Active Incidents"
        value={stats.activeIncidents ?? 0}
        icon={IconAlertTriangle}
        tint="#D9480F"
        trend={3}
        trendLabel="vs last hour"
        cardClass="stat-card-orange"
      />
      <StatCard
        id="spark2"
        label="Resolved Today"
        value={stats.resolvedToday ?? 0}
        icon={IconCheckCircle}
        tint="#087F5B"
        trend={18}
        trendLabel="vs yesterday"
        cardClass="stat-card-green"
      />
      <StatCard
        id="spark3"
        label="Avg Confidence"
        value={stats.avgConfidence ?? 0}
        unit="%"
        icon={IconDial}
        tint="#3B5BDB"
        trend={2.4}
        trendLabel="vs yesterday"
        cardClass="stat-card-blue"
      />
      <StatCard
        id="spark4"
        label="Auto-Pilot Types"
        value={stats.autoPilotEnabled ?? 0}
        icon={IconBolt}
        tint="#748FFC"
        trendLabel="Active across systems"
        cardClass="stat-card-violet"
      />
    </div>
  );
}