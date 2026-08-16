const SEVERITY_STYLE = {
  low: { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  medium: { bg: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  high: { bg: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  critical: { bg: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

const STATUS_STYLE = {
  active: { bg: "bg-green-50 text-green-700 border-green-200", label: "Active" },
  diagnosed: { bg: "bg-green-50 text-green-700 border-green-200", label: "Active" },
  pending_approval: { bg: "bg-green-50 text-green-700 border-green-200", label: "Active" },
  resolved: { bg: "bg-slate-50 text-slate-600 border-slate-200", label: "Resolved" },
  rejected: { bg: "bg-slate-50 text-slate-600 border-slate-200", label: "Rejected" },
  failed: { bg: "bg-red-50 text-red-700 border-red-200", label: "Failed" },
};

function Badge({ className, children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${className}`}>
      {children}
    </span>
  );
}

export default function RecentIncidentsTable({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-fg-subtle">No recent incidents.</p>
      </div>
    );
  }

  const rows = [...incidents]
    .sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))
    .slice(0, 6);

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">
          Incidents <span className="text-fg-muted font-mono">(LIVE FEED)</span>
        </p>
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-positive opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-positive" />
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.1em] text-fg-subtle border-b border-border-subtle bg-surface-raised/50">
              <th className="px-4 py-2.5 font-semibold">ID</th>
              <th className="px-4 py-2.5 font-semibold">Source</th>
              <th className="px-4 py-2.5 font-semibold">Severity</th>
              <th className="px-4 py-2.5 font-semibold">Status</th>
              <th className="px-4 py-2.5 font-semibold">Confidence</th>
              <th className="px-4 py-2.5 font-semibold">Detected At</th>
              <th className="px-4 py-2.5 font-semibold">Auto-Pilot</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inc) => {
              const sev = SEVERITY_STYLE[inc.severity] || SEVERITY_STYLE.medium;
              const stat = STATUS_STYLE[inc.status] || STATUS_STYLE.active;
              return (
                <tr
                  key={inc.id}
                  className="border-t border-border-subtle hover:bg-surface-raised/40 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-fg font-medium">{inc.id.slice(0, 18)}</td>
                  <td className="px-4 py-3 text-fg-muted">{inc.source}</td>
                  <td className="px-4 py-3">
                    <Badge className={sev.bg}>
                      {inc.severity?.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={stat.bg}>{stat.label}</Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-fg-muted tabular-nums">
                    {inc.confidence}%
                  </td>
                  <td className="px-4 py-3 font-mono text-fg-subtle tabular-nums">
                    {new Date(inc.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="px-4 py-3 font-mono text-fg-muted text-[11px]">
                    {inc.auto_pilot_type || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-5 py-3 border-t border-border-subtle flex items-center justify-between text-[12px] text-fg-subtle">
        <span>Showing {rows.length} of {incidents.length} incidents</span>
        <button className="text-accent font-semibold hover:underline">View all incidents →</button>
      </div>
    </div>
  );
}