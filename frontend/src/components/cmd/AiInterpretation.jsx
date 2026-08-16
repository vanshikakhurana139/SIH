export default function AiInterpretation({ incident }) {
  if (!incident) {
    return (
      <div className="ivory-card p-8 rounded-3xl border border-slate-200/80 shadow-sm bg-white/90 flex flex-col items-center justify-center text-center min-h-[220px]">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-3 text-2xl">🧠</div>
        <p className="text-base font-bold text-slate-800">No Active Incident</p>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">Simulate a sensor reading from the top control panel to trigger live AI diagnosis.</p>
      </div>
    );
  }

  const sevColor = {
    critical: "#B84040",
    high: "#C0562A",
    medium: "#B07B2E",
    low: "#2D6A9E",
  }[incident.severity] || "#B8963E";

  return (
    <div className="ivory-card p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-sm bg-white/90">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-violet-50 text-violet-700 border border-violet-200/80">
          AI Interpretation
        </span>
        <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20">
          LIVE ANALYSIS
        </span>
      </div>

      {/* Pattern banner */}
      <div
        className="rounded-2xl p-4.5 mb-6 border-l-4 shadow-2xs"
        style={{ background: "rgba(184,64,64,0.06)", borderColor: "#B84040" }}
      >
        <p className="text-xs uppercase tracking-widest font-extrabold mb-2 flex items-center gap-2 text-rose-700">
          <span>⚠</span> Anomaly Pattern Detected
        </p>
        <p className="text-sm font-semibold text-slate-800 leading-relaxed">{incident.evidence}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Correlated Signals", value: "4", color: null },
          { label: "Rule Match", value: incident.rule_id, color: "var(--color-gold)" },
          { label: "AI Confidence", value: `${incident.confidence}%`, color: incident.confidence >= 90 ? "#2D7A5A" : "#B07B2E" },
          { label: "Severity Level", value: (incident.severity || "").toUpperCase(), color: sevColor },
          { label: "Escalation Risk", value: "82%", color: "#C0562A" },
          { label: "Reversible State", value: incident.reversible ? "Yes" : "No", color: incident.reversible ? "#2D7A5A" : "#B84040" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl p-3.5 bg-slate-50/80 border border-slate-200/70"
          >
            <p className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">{label}</p>
            <p className="text-base font-bold font-mono" style={{ color: color || "var(--color-fg)" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
