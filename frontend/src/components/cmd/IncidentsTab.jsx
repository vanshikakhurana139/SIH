const SEVERITY_STYLE = {
  low:      { bg: "rgba(45,106,158,0.08)",  text: "#2D6A9E",  border: "rgba(45,106,158,0.22)" },
  medium:   { bg: "rgba(176,123,46,0.08)",  text: "#B07B2E",  border: "rgba(176,123,46,0.22)" },
  high:     { bg: "rgba(192,86,42,0.08)",   text: "#C0562A",  border: "rgba(192,86,42,0.22)" },
  critical: { bg: "rgba(184,64,64,0.08)",   text: "#B84040",  border: "rgba(184,64,64,0.22)" },
};
const STATUS_STYLE = {
  diagnosed:        { bg: "rgba(184,150,62,0.08)", text: "#B8963E", border: "rgba(184,150,62,0.22)", label: "Active" },
  pending_approval: { bg: "rgba(184,150,62,0.08)", text: "#B8963E", border: "rgba(184,150,62,0.22)", label: "Active" },
  resolved:         { bg: "rgba(45,122,90,0.08)",  text: "#2D7A5A", border: "rgba(45,122,90,0.22)",  label: "Resolved" },
  rejected:         { bg: "rgba(155,155,155,0.08)", text: "#5C5043", border: "rgba(155,155,155,0.22)", label: "Rejected" },
  failed:           { bg: "rgba(184,64,64,0.08)",  text: "#B84040", border: "rgba(184,64,64,0.22)",  label: "Failed" },
  undone:           { bg: "rgba(155,155,155,0.08)", text: "#5C5043", border: "rgba(155,155,155,0.22)", label: "Undone" },
};

function Badge({ style, children }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {children}
    </span>
  );
}

export default function IncidentsTab({ incidents }) {
  const sorted = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <p className="dash-eyebrow mb-1">Incidents</p>
        <h2 className="font-display text-[32px] text-fg" style={{ letterSpacing: "-0.01em" }}>
          Incident Feed
        </h2>
        <p className="text-[13px] text-fg-muted mt-1">All detected anomalies and AI-diagnosed incidents from the backend.</p>
      </div>

      {sorted.length === 0 ? (
        <div className="ivory-card p-12 text-center">
          <p className="text-[15px] font-semibold text-fg-muted">No incidents recorded yet.</p>
          <p className="text-[12px] text-fg-subtle mt-1">Simulate a sensor reading from the Config tab to trigger an incident.</p>
        </div>
      ) : (
        <div className="ivory-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <p className="text-[12px] font-semibold text-fg-muted">{sorted.length} incidents total</p>
            <div className="flex items-center gap-1.5">
              <span className="live-dot w-2 h-2 rounded-full" style={{ backgroundColor: "#2D7A5A", display: "inline-block" }} />
              <span className="text-[10px] font-mono font-bold text-positive" style={{ color: "#2D7A5A" }}>LIVE FEED</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-subtle" style={{ background: "rgba(250,248,244,0.8)" }}>
                  {["ID", "Source", "Severity", "Status", "Confidence", "Detected", "Reversible"].map((col) => (
                    <th key={col} className="px-5 py-3 text-left text-[10px] uppercase tracking-wider font-bold text-fg-subtle">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((inc) => {
                  const sev = SEVERITY_STYLE[inc.severity] || SEVERITY_STYLE.medium;
                  const stat = STATUS_STYLE[inc.status] || STATUS_STYLE.diagnosed;
                  return (
                    <tr key={inc.id} className="border-t border-border-subtle hover:bg-ivory/60 transition-colors">
                      <td className="px-5 py-3.5 font-mono text-[11px] text-fg-muted">{inc.id.slice(0, 16)}…</td>
                      <td className="px-5 py-3.5 text-fg font-medium">{inc.source?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-3.5"><Badge style={sev}>{inc.severity}</Badge></td>
                      <td className="px-5 py-3.5"><Badge style={stat}>{stat.label}</Badge></td>
                      <td className="px-5 py-3.5 font-mono text-fg-muted tabular-nums">{inc.confidence ?? "—"}%</td>
                      <td className="px-5 py-3.5 font-mono text-fg-subtle tabular-nums text-[11px]">
                        {new Date(inc.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[11px] font-semibold" style={{ color: inc.reversible ? "#2D7A5A" : "#B84040" }}>
                          {inc.reversible ? "✓ Yes" : "✗ No"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
