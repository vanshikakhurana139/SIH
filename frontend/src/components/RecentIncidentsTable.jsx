import { SeverityLight, StatusLight } from "./StatusLight";

export default function RecentIncidentsTable({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-fg-subtle">No recent incidents.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">Recent Incidents</p>
      </div>
      <table className="w-full text-[13px]">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
            <th className="px-5 py-2.5 font-semibold">Source</th>
            <th className="px-5 py-2.5 font-semibold">Severity</th>
            <th className="px-5 py-2.5 font-semibold">Confidence</th>
            <th className="px-5 py-2.5 font-semibold">Status</th>
            <th className="px-5 py-2.5 font-semibold text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {incidents.map((inc) => (
            <tr
              key={inc.id}
              className="border-t border-border-subtle hover:bg-surface-raised/50 transition-colors"
            >
              <td className="px-5 py-3 font-mono text-fg">{inc.source}</td>
              <td className="px-5 py-3">
                <SeverityLight severity={inc.severity} />
              </td>
              <td className="px-5 py-3 font-mono text-fg-muted tabular-nums">{inc.confidence}%</td>
              <td className="px-5 py-3">
                <StatusLight status={inc.status} />
              </td>
              <td className="px-5 py-3 text-right font-mono text-fg-subtle tabular-nums">
                {new Date(inc.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}