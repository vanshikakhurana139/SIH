export default function AiInterpretation({ incident }) {
  if (!incident) {
    return (
      <div className="ivory-card p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 200 }}>
        <div className="w-10 h-10 rounded-xl bg-border-subtle/50 flex items-center justify-center mb-3 text-[20px]">🧠</div>
        <p className="text-[13px] font-semibold text-fg-muted">No active incident</p>
        <p className="text-[11px] text-fg-subtle mt-1">Simulate a sensor reading to trigger AI analysis</p>
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
    <div className="ivory-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="dash-eyebrow">AI Interpretation</p>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border"
          style={{ color: "#B8963E", background: "rgba(184,150,62,0.08)", borderColor: "rgba(184,150,62,0.22)" }}>
          LIVE ANALYSIS
        </span>
      </div>

      {/* Pattern banner */}
      <div
        className="rounded-xl p-4 mb-5 border-l-4"
        style={{ background: "rgba(184,64,64,0.06)", borderColor: "#B84040" }}
      >
        <p className="text-[9.5px] uppercase tracking-widest font-bold mb-2 flex items-center gap-1.5" style={{ color: "#B84040" }}>
          <span>⚠</span> Pattern Detected
        </p>
        <p className="text-[13px] text-fg font-medium leading-relaxed">{incident.evidence}</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Correlated Signals", value: "4", color: null },
          { label: "Rule Match", value: incident.rule_id, color: "var(--color-gold)" },
          { label: "Confidence", value: `${incident.confidence}%`, color: incident.confidence >= 90 ? "#2D7A5A" : "#B07B2E" },
          { label: "Severity", value: (incident.severity || "").toUpperCase(), color: sevColor },
          { label: "Escalation Probability", value: "82%", color: "#C0562A" },
          { label: "Reversible", value: incident.reversible ? "Yes" : "No", color: incident.reversible ? "#2D7A5A" : "#B84040" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl px-3 py-2.5"
            style={{ background: "rgba(26,22,18,0.03)", border: "1px solid rgba(180,160,120,0.10)" }}
          >
            <p className="text-[9.5px] uppercase tracking-wider font-bold text-fg-subtle mb-0.5">{label}</p>
            <p className="text-[13px] font-bold font-mono" style={{ color: color || "var(--color-fg)" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
