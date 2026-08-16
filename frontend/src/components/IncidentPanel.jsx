function classifyStage(status) {
  if (["resolved", "rejected", "undone", "failed"].includes(status)) return 2; // completed
  if (["diagnosed", "pending_approval", "approved", "modified"].includes(status)) return 1; // active
  return 0; // pending
}

export default function IncidentPanel({ incident }) {
  const stage = classifyStage(incident?.status);

  const subDetails = incident
    ? [
        {
          time: new Date(incident.triggered_at).toLocaleTimeString([], { hour12: false }),
          text: `Incident triggered on ${incident.source} (rule ${incident.rule_id})`,
        },
        { time: "", text: incident.evidence || "Evidence pending diagnosis." },
        {
          time: "",
          text: incident.recommended_action
            ? `Recommended: ${incident.recommended_action.split("\n")[0].replace(/^\d+\.\s*/, "")}`
            : "Recommendation pending.",
        },
        { time: "", text: `Status: ${incident.status.replace(/_/g, " ")}` },
      ]
    : [{ time: "", text: "No active incident — run a simulation to populate this panel." }];

  return (
    <div className="dash-card px-5 py-5 flex flex-col">
      <p className="dash-eyebrow mb-3">Incident</p>

      <p className="font-display text-4xl font-extrabold text-fg tabular-nums leading-none">
        {incident ? incident.sensor_value : "—"}
        {incident && <span className="text-base font-semibold text-fg-subtle ml-1">/ {incident.threshold}</span>}
      </p>
      <p className="text-[11px] text-fg-subtle mt-1 font-mono">
        {incident ? incident.source : "sensor"}
      </p>

      <div className="mt-4 pt-4 border-t border-border-subtle">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-fg-muted mb-2">
          Live Sub-Details
        </p>
        <ul className="space-y-2">
          {subDetails.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] leading-snug">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
              <span className="text-fg-muted">
                {d.time && <span className="font-mono text-fg-subtle mr-1.5">{d.time}</span>}
                {d.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-5 pt-4 border-t border-border-subtle">
        <p className="text-[11px] font-bold uppercase tracking-[0.06em] text-fg-muted mb-3">
          Pipeline Stepper
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">
            Concurrent operations
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised text-fg-muted">
            Operations labels
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-raised text-fg-muted">
            Milestone labels
          </span>
        </div>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 h-[2px] bg-border-subtle top-1/2 -translate-y-1/2" />
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="relative w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: i <= stage ? "var(--color-accent)" : "var(--color-border-strong)",
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-fg-subtle">
          <span>Completed</span>
          <span>Active</span>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}
