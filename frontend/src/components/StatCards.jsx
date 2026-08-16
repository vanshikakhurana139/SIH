import { IconAlertTriangle, IconCheckCircle, IconDial, IconBolt } from "../icons";

function Sparkline({ color = "#3B5BDB", id = "spark" }) {
  return (
    <svg viewBox="0 0 100 36" className="w-full h-10 overflow-visible" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.30} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <polygon
        points="0,36 0,22 12,18 25,24 38,10 50,16 62,6 75,14 88,4 100,10 100,36"
        fill={`url(#${id})`}
      />
      <polyline
        points="0,22 12,18 25,24 38,10 50,16 62,6 75,14 88,4 100,10"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 3px 6px ${color}50)` }}
      />
    </svg>
  );
}

function StatCard({ label, value, unit, icon: Icon, tint, trend, trendLabel, cardClass, id }) {
  return (
    <div className={`dash-card ${cardClass} p-6 relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md rounded-3xl border border-slate-200/70 bg-white/90`}>
      {/* Background radial highlight */}
      <div
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-35 pointer-events-none transition-opacity group-hover:opacity-65"
        style={{ background: tint }}
      />

      {/* Header pill badge and icon */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span
          className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest border transition-colors"
          style={{ backgroundColor: `${tint}12`, color: tint, borderColor: `${tint}30` }}
        >
          {label}
        </span>
        <span
          className="flex items-center justify-center w-10 h-10 rounded-2xl shrink-0 border transition-transform group-hover:scale-110 shadow-xs"
          style={{ backgroundColor: `${tint}15`, color: tint, borderColor: `${tint}25` }}
        >
          <Icon width={20} height={20} />
        </span>
      </div>

      {/* Main Metric Value */}
      <div className="relative z-10 mb-2">
        <p className="font-display text-4xl sm:text-5xl font-black tabular-nums leading-none tracking-tight text-slate-900">
          {value}
          {unit && <span className="text-xl text-slate-500 font-bold ml-1">{unit}</span>}
        </p>
      </div>

      {/* Trend indicator */}
      {trend != null && (
        <div className="relative z-10 flex items-center gap-1.5 text-[12px] font-extrabold mb-3" style={{ color: trend >= 0 ? "#087F5B" : "#C92A2A" }}>
          <span className="text-xs">{trend >= 0 ? "▲" : "▼"}</span>
          <span>{Math.abs(trend)} {trendLabel}</span>
        </div>
      )}
      {trend == null && trendLabel && (
        <p className="relative z-10 text-[12px] font-semibold text-slate-500 mb-3">{trendLabel}</p>
      )}

      {/* Sparkline Graph */}
      <div className="mt-auto -mx-1 relative z-10 pt-1">
        <Sparkline color={tint} id={id} />
      </div>
    </div>
  );
}

export default function StatCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        trend={null}
        trendLabel="Active across systems"
        cardClass="stat-card-violet"
      />
    </div>
  );
}