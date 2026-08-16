const SEVERITY_STYLE = {
  low:      { bg: "rgba(29,78,216,0.1)",   text: "#1D4ED8", border: "rgba(29,78,216,0.3)" },
  medium:   { bg: "rgba(180,83,9,0.1)",   text: "#B45309", border: "rgba(180,83,9,0.3)" },
  high:     { bg: "rgba(194,65,12,0.1)",   text: "#C2410C", border: "rgba(194,65,12,0.3)" },
  critical: { bg: "rgba(185,28,28,0.1)",   text: "#B91C1C", border: "rgba(185,28,28,0.3)" },
};

const STATUS_STYLE = {
  diagnosed:        { bg: "rgba(184,150,62,0.12)", text: "#B8963E", border: "rgba(184,150,62,0.3)", label: "Active" },
  pending_approval: { bg: "rgba(184,150,62,0.12)", text: "#B8963E", border: "rgba(184,150,62,0.3)", label: "Active" },
  resolved:         { bg: "rgba(21,128,61,0.12)",  text: "#15803D", border: "rgba(21,128,61,0.3)",  label: "Resolved" },
  rejected:         { bg: "rgba(71,85,105,0.12)", text: "#334155", border: "rgba(71,85,105,0.3)", label: "Rejected" },
  failed:           { bg: "rgba(185,28,28,0.12)",  text: "#B91C1C", border: "rgba(185,28,28,0.3)",  label: "Failed" },
  undone:           { bg: "rgba(71,85,105,0.12)", text: "#334155", border: "rgba(71,85,105,0.3)", label: "Undone" },
};

function Badge({ style, children }) {
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border shadow-2xs"
      style={{ background: style.bg, color: style.text, borderColor: style.border }}
    >
      {children}
    </span>
  );
}

export default function IncidentsTab({ incidents }) {
  const sorted = [...(incidents || [])].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));

  return (
    <div className="flex-1 overflow-y-auto p-6 sm:p-8">
      <div className="mb-8 max-w-[1700px] mx-auto">
        <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
          Telemetry Records
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
          Incident Feed Log
        </h2>
        <p className="text-base font-bold text-slate-600 mt-1">
          All real-time detected anomalies and AI-diagnosed incidents across connected subsystems.
        </p>
      </div>

      <div className="max-w-[1700px] mx-auto">
        {sorted.length === 0 ? (
          <div className="ivory-card p-12 sm:p-16 text-center rounded-3xl border border-slate-200 shadow-sm bg-white/95">
            <span className="text-4xl">🟢</span>
            <h3 className="text-xl font-black text-slate-900 mt-3">No Active Incidents</h3>
            <p className="text-sm font-bold text-slate-600 mt-1 max-w-md mx-auto">
              All monitored system components are operating within nominal parameters. Use the Configuration tab to simulate a sensor reading anomaly.
            </p>
          </div>
        ) : (
          <div className="ivory-card rounded-3xl border border-slate-200 shadow-sm bg-white/95 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <p className="text-sm font-black text-slate-900">{sorted.length} Total Incidents Logged</p>
              <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full">
                <span className="live-dot w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#15803D", display: "inline-block" }} />
                <span className="text-xs font-black text-emerald-900">LIVE FEED</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/70">
                    {["Incident ID", "Source Component", "Severity", "Status", "AI Confidence", "Timestamp", "Rollback Safe"].map((col) => (
                      <th key={col} className="px-6 py-4 text-left text-xs uppercase tracking-wider font-black text-slate-600">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sorted.map((inc) => {
                    const sev = SEVERITY_STYLE[inc.severity] || SEVERITY_STYLE.medium;
                    const stat = STATUS_STYLE[inc.status] || STATUS_STYLE.diagnosed;
                    return (
                      <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">{inc.id.slice(0, 16)}…</td>
                        <td className="px-6 py-4 text-slate-900 font-extrabold capitalize">{inc.source?.replace(/_/g, " ")}</td>
                        <td className="px-6 py-4"><Badge style={sev}>{inc.severity}</Badge></td>
                        <td className="px-6 py-4"><Badge style={stat}>{stat.label}</Badge></td>
                        <td className="px-6 py-4 font-sans text-sm font-black text-slate-900 tabular-nums">{inc.confidence ?? "—"}%</td>
                        <td className="px-6 py-4 font-sans text-xs font-bold text-slate-700 tabular-nums">
                          {new Date(inc.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-md border ${inc.reversible ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-rose-100 text-rose-900 border-rose-300"}`}>
                            {inc.reversible ? "✓ Reversible" : "✗ Irreversible"}
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
    </div>
  );
}
