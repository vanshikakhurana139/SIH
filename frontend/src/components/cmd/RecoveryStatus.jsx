export default function RecoveryStatus({ healthCheck }) {
  if (!healthCheck) return null;

  const { resolved = 0, failed = 0, pending = 0 } = healthCheck;
  const total = resolved + failed + pending;
  const pct = total ? Math.round((resolved / total) * 100) : 0;

  const segments = [
    { label: "Resolved", value: resolved, color: "#15803D" },
    { label: "Pending",  value: pending,  color: "#B45309" },
    { label: "Failed",   value: failed,   color: "#B91C1C" },
  ];

  return (
    <div className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-sm bg-white/95">
      <div className="flex items-center justify-between mb-5">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100/90 text-emerald-900 border border-emerald-300 shadow-2xs">
          System Recovery Status
        </span>
        <span className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">HEALTH CYCLE</span>
      </div>

      {/* Arc gauge */}
      <div className="flex items-center gap-6 mb-5 p-5 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="relative shrink-0">
          <svg viewBox="0 0 90 90" width="88" height="88">
            {/* Track */}
            <circle cx="45" cy="45" r="35" fill="none" stroke="rgba(203,213,225,0.8)" strokeWidth="8" />
            {/* Progress */}
            <circle
              cx="45" cy="45" r="35"
              fill="none"
              stroke={pct >= 80 ? "#15803D" : pct >= 50 ? "#B45309" : "#B91C1C"}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 220} 220`}
              transform="rotate(-90 45 45)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <text x="45" y="52" textAnchor="middle" fontSize="18" fontWeight="900" fontFamily="sans-serif" fill="#0F172A">
              {pct}%
            </text>
          </svg>
        </div>

        <div>
          <p className="text-3xl sm:text-4xl font-black font-sans text-slate-900 tabular-nums leading-none tracking-tight">
            {resolved}<span className="text-lg text-slate-600 font-bold ml-1">/ {total}</span>
          </p>
          <p className="text-xs font-extrabold text-slate-700 mt-1">Health Checks Resolved</p>
        </div>
      </div>

      <div className="space-y-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-900 font-black">{s.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-28 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: total ? `${(s.value / total) * 100}%` : "0%",
                    backgroundColor: s.color,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <span className="font-sans text-xs font-black text-slate-900 tabular-nums w-6 text-right">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
