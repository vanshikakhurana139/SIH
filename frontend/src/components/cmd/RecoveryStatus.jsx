export default function RecoveryStatus({ healthCheck }) {
  if (!healthCheck) return null;

  const { resolved = 0, failed = 0, pending = 0 } = healthCheck;
  const total = resolved + failed + pending;
  const pct = total ? Math.round((resolved / total) * 100) : 0;

  const segments = [
    { label: "Resolved", value: resolved, color: "#2D7A5A" },
    { label: "Pending",  value: pending,  color: "#B07B2E" },
    { label: "Failed",   value: failed,   color: "#B84040" },
  ];

  return (
    <div className="ivory-card p-5">
      <p className="dash-eyebrow mb-4">Recovery Status</p>

      {/* Arc gauge */}
      <div className="flex items-center gap-5 mb-4">
        <div className="relative shrink-0">
          <svg viewBox="0 0 80 80" width="72" height="72">
            {/* Track */}
            <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(180,160,120,0.15)" strokeWidth="7" />
            {/* Progress */}
            <circle
              cx="40" cy="40" r="30"
              fill="none"
              stroke={pct >= 80 ? "#2D7A5A" : pct >= 50 ? "#B07B2E" : "#B84040"}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 188} 188`}
              transform="rotate(-90 40 40)"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
            <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="monospace" fill="#1A1612">
              {pct}%
            </text>
          </svg>
        </div>

        <div>
          <p className="text-[26px] font-black font-display text-fg tabular-nums leading-none">{resolved}<span className="text-[14px] text-fg-subtle font-semibold ml-1">/ {total}</span></p>
          <p className="text-[11px] text-fg-subtle mt-0.5">checks resolved</p>
        </div>
      </div>

      <div className="space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-[12px] text-fg-muted font-medium">{s.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-20 h-1.5 bg-border-subtle rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: total ? `${(s.value / total) * 100}%` : "0%",
                    backgroundColor: s.color,
                    transition: "width 0.6s ease",
                  }}
                />
              </div>
              <span className="font-mono text-[12px] font-bold text-fg tabular-nums w-6 text-right">{s.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
