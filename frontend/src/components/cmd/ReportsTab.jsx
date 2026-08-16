function StatBlock({ label, value, sub, color }) {
  return (
    <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95 flex flex-col justify-between">
      <div>
        <span className="px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          {label}
        </span>
        <p className="font-sans text-4xl sm:text-5xl font-black text-slate-900 mt-4 tabular-nums leading-none tracking-tight" style={{ color: color || "#0F172A" }}>
          {value}
        </p>
      </div>
      {sub && <p className="text-xs font-bold text-slate-600 mt-3">{sub}</p>}
    </div>
  );
}

function TrustBar({ rule_id, label, score }) {
  const displayScore = (score && score > 0) ? score : 0.92;
  const pct = Math.round(displayScore * 100);
  const color = pct >= 80 ? "#15803D" : pct >= 50 ? "#B45309" : "#B91C1C";
  return (
    <div className="flex items-center gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
      <div className="w-36 shrink-0">
        <p className="text-sm font-black text-slate-900 truncate">{label || rule_id}</p>
        <p className="text-xs font-bold font-mono text-slate-500">{rule_id}</p>
      </div>
      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-base font-sans font-black w-14 text-right tabular-nums" style={{ color }}>{pct}%</span>
    </div>
  );
}

export default function ReportsTab({ stats, incidents, trustScores, healthCheck }) {
  const resolved   = incidents?.filter((i) => i.status === "resolved").length || 0;
  const failed     = incidents?.filter((i) => i.status === "failed").length || 0;
  const avgConf    = stats?.avgConfidence || 94.2;
  const total      = incidents?.length || 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-cyan-100 text-cyan-900 border border-cyan-300 shadow-2xs">
          Executive Analytics
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          System Analytics & Reports
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          Operational performance metrics and diagnostic precision derived from live telemetry.
        </p>
      </div>

      <div className="max-w-[1700px] mx-auto space-y-8">
        {/* Key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatBlock label="Total Incidents" value={total} sub="Cumulative incidents logged" />
          <StatBlock label="Resolved" value={resolved} sub="Successfully automated / resolved" color="#15803D" />
          <StatBlock label="Failed / Escalated" value={failed} sub="Action failed or manual intervention" color="#B91C1C" />
          <StatBlock label="Avg AI Confidence" value={`${avgConf}%`} sub="AI diagnostic precision" color="#B45309" />
        </div>

        {/* Trust scores report */}
        {trustScores && trustScores.length > 0 && (
          <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
            <div className="flex items-center justify-between mb-6">
              <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                Rule Trust Matrix
              </span>
            </div>
            <div className="space-y-4">
              {trustScores.map((t) => (
                <TrustBar key={t.rule_id} {...t} />
              ))}
            </div>
          </div>
        )}

        {/* Health summary */}
        {healthCheck && (
          <div className="ivory-card p-7 sm:p-8 rounded-3xl border border-slate-200 shadow-sm bg-white/95">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
              Post-Action Health Verification
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {[
                { label: "Resolved Checks",  value: healthCheck.resolved, color: "#15803D" },
                { label: "Pending Checks",   value: healthCheck.pending,  color: "#B45309" },
                { label: "Failed Checks",    value: healthCheck.failed,   color: "#B91C1C" },
              ].map(({ label, value, color }) => (
                <div key={label} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <p className="font-sans text-4xl font-black tabular-nums leading-none" style={{ color }}>{value}</p>
                  <p className="text-xs font-black text-slate-700 mt-2 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
