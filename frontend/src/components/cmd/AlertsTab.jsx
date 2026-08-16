const SEV_COLOR = {
  critical: { text: "#B84040", bg: "rgba(184,64,64,0.08)", border: "rgba(184,64,64,0.22)" },
  high:     { text: "#C0562A", bg: "rgba(192,86,42,0.08)", border: "rgba(192,86,42,0.22)" },
  medium:   { text: "#B07B2E", bg: "rgba(176,123,46,0.08)", border: "rgba(176,123,46,0.22)" },
  low:      { text: "#2D6A9E", bg: "rgba(45,106,158,0.08)", border: "rgba(45,106,158,0.22)" },
};

function AlertRow({ incident }) {
  const c = SEV_COLOR[incident.severity] || SEV_COLOR.medium;
  const isActive = incident.status === "diagnosed" || incident.status === "pending_approval";
  return (
    <div
      className="flex items-start gap-5 px-6 py-4 border-t border-border-subtle hover:bg-ivory/50 transition-colors"
    >
      {/* Severity indicator */}
      <div className="shrink-0 mt-0.5">
        <span
          className="w-2 h-2 rounded-full block"
          style={{ backgroundColor: c.text, animation: isActive ? "pulse-ring 1.8s ease-out infinite" : "none" }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="px-2 py-0.5 rounded-lg text-[9.5px] font-bold uppercase tracking-wider border"
            style={{ background: c.bg, color: c.text, borderColor: c.border }}
          >
            {incident.severity?.toUpperCase()}
          </span>
          <span className="text-[11px] font-mono text-fg-subtle">{incident.rule_id}</span>
        </div>
        <p className="text-[13px] font-semibold text-fg truncate">
          {incident.source?.replace(/_/g, " ").replace(/\b\w/g, (ch) => ch.toUpperCase())} — Threshold Exceeded
        </p>
        <p className="text-[11px] text-fg-subtle mt-0.5 truncate">{incident.evidence?.substring(0, 80)}</p>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[11px] font-mono text-fg-subtle tabular-nums">
          {new Date(incident.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        <span
          className="text-[10px] font-bold"
          style={{ color: isActive ? "#B8963E" : "#2D7A5A" }}
        >
          {isActive ? "● Active" : "✓ Resolved"}
        </span>
      </div>
    </div>
  );
}

export default function AlertsTab({ incidents }) {
  const sorted = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
  const active   = sorted.filter((i) => i.status === "diagnosed" || i.status === "pending_approval");
  const resolved = sorted.filter((i) => i.status !== "diagnosed" && i.status !== "pending_approval");

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="dash-eyebrow mb-1">Alerts</p>
        <h2 className="font-display text-[32px] text-fg" style={{ letterSpacing: "-0.01em" }}>Alert Feed</h2>
        <p className="text-[13px] text-fg-muted mt-1">
          {active.length > 0
            ? `${active.length} active alert${active.length > 1 ? "s" : ""} requiring attention.`
            : "No active alerts. All systems nominal."}
        </p>
      </div>

      {/* Active alerts */}
      {active.length > 0 && (
        <div className="ivory-card overflow-hidden mb-6" style={{ borderColor: "rgba(184,64,64,0.25)" }}>
          <div className="px-6 py-3 border-b border-border-subtle flex items-center gap-2" style={{ background: "rgba(184,64,64,0.04)" }}>
            <span className="live-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#B84040", display: "inline-block" }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#B84040" }}>Active Alerts</span>
          </div>
          {active.map((inc) => <AlertRow key={inc.id} incident={inc} />)}
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div className="ivory-card overflow-hidden">
          <div className="px-6 py-3 border-b border-border-subtle flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#2D7A5A", display: "inline-block" }} />
            <span className="text-[10px] font-bold uppercase tracking-widest text-positive" style={{ color: "#2D7A5A" }}>Resolved & Closed</span>
          </div>
          {resolved.slice(0, 8).map((inc) => <AlertRow key={inc.id} incident={inc} />)}
        </div>
      )}

      {sorted.length === 0 && (
        <div className="ivory-card p-12 text-center">
          <p className="text-[15px] font-semibold text-fg-muted">No alerts yet.</p>
          <p className="text-[12px] text-fg-subtle mt-1">Simulate a sensor reading to generate your first alert.</p>
        </div>
      )}
    </div>
  );
}
