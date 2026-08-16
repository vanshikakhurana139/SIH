function StatBlock({ label, value, sub, color }) {
  return (
    <div className="ivory-card p-6">
      <p className="dash-eyebrow mb-3">{label}</p>
      <p className="font-display text-[44px] font-bold leading-none tabular-nums" style={{ color: color || "var(--color-fg)", letterSpacing: "-0.02em" }}>{value}</p>
      {sub && <p className="text-[12px] text-fg-subtle mt-2">{sub}</p>}
    </div>
  );
}

function TrustBar({ rule_id, label, score }) {
  const pct = Math.round((score || 0) * 100);
  const color = pct >= 80 ? "#2D7A5A" : pct >= 50 ? "#B07B2E" : "#B84040";
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 shrink-0">
        <p className="text-[11px] font-bold text-fg truncate">{label || rule_id}</p>
        <p className="text-[10px] font-mono text-fg-subtle">{rule_id}</p>
      </div>
      <div className="flex-1 h-2 bg-border-subtle rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-[12px] font-mono font-bold w-10 text-right tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function ReportsTab({ stats, incidents, trustScores, healthCheck }) {
  const resolved   = incidents?.filter((i) => i.status === "resolved").length || 0;
  const failed     = incidents?.filter((i) => i.status === "failed").length || 0;
  const avgConf    = stats?.avgConfidence || 0;
  const total      = incidents?.length || 0;

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="dash-eyebrow mb-1">Reports</p>
        <h2 className="font-display text-[32px] text-fg" style={{ letterSpacing: "-0.01em" }}>Analytics & Reports</h2>
        <p className="text-[13px] text-fg-muted mt-1">Operational performance metrics derived from live backend data.</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <StatBlock label="Total Incidents" value={total} sub="All time" />
        <StatBlock label="Resolved" value={resolved} sub="Successfully actioned" color="#2D7A5A" />
        <StatBlock label="Failed" value={failed} sub="Action failed" color="#B84040" />
        <StatBlock label="Avg Confidence" value={`${avgConf}%`} sub="AI diagnosis accuracy" color="#B8963E" />
      </div>

      {/* Trust scores report */}
      {trustScores && trustScores.length > 0 && (
        <div className="ivory-card p-6 mb-6">
          <p className="dash-eyebrow mb-4">Rule Trust Scores</p>
          <div className="space-y-4">
            {trustScores.map((t) => (
              <TrustBar key={t.rule_id} {...t} />
            ))}
          </div>
        </div>
      )}

      {/* Health summary */}
      {healthCheck && (
        <div className="ivory-card p-6">
          <p className="dash-eyebrow mb-5">Post-Action Health Check Summary</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { label: "Resolved",  value: healthCheck.resolved, color: "#2D7A5A" },
              { label: "Pending",   value: healthCheck.pending,  color: "#B07B2E" },
              { label: "Failed",    value: healthCheck.failed,   color: "#B84040" },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className="font-display text-[40px] font-bold tabular-nums leading-none" style={{ color }}>{value}</p>
                <p className="text-[11px] text-fg-subtle mt-2 uppercase tracking-wider font-bold">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
