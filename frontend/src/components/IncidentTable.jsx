import { useState } from "react";
import { StatusLight } from "./StatusLight";

const SEVERITY_COLOR = {
  low: "var(--color-severity-low)",
  medium: "var(--color-severity-medium)",
  high: "var(--color-severity-high)",
  critical: "var(--color-severity-critical)",
};

function MiniBar({ label, value, color }) {
  return (
    <div className="min-w-[110px]">
      <p className="text-[11px] font-mono text-fg-muted mb-1 truncate">{label}</p>
      <div className="h-1.5 rounded-full bg-surface-raised overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(6, Math.min(100, value))}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function responseTime(triggeredAt) {
  const secs = Math.max(0, Math.floor((Date.now() - new Date(triggeredAt).getTime()) / 1000));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function IncidentTable({ incidents }) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (!incidents || incidents.length === 0) {
    return (
      <div className="dash-card p-6">
        <p className="text-sm text-fg-subtle">No recent incidents.</p>
      </div>
    );
  }

  const rows = [...incidents]
    .sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))
    .slice(0, 8);

  return (
    <div className="dash-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border-subtle">
        <p className="dash-eyebrow">Table Rows</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-[0.08em] text-fg-subtle">
              <th className="px-5 py-2.5 font-semibold">Incident ID ↓</th>
              <th className="px-5 py-2.5 font-semibold">Timestamp</th>
              <th className="px-5 py-2.5 font-semibold">Response Time</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
              <th className="px-5 py-2.5 font-semibold">Report</th>
              <th className="px-5 py-2.5 font-semibold">Sensor</th>
              <th className="px-5 py-2.5 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inc) => (
              <tr key={inc.id} className="border-t border-border-subtle hover:bg-surface-raised/50 transition-colors">
                <td className="px-5 py-3 font-mono text-fg">{inc.id.slice(0, 7)}</td>
                <td className="px-5 py-3 font-mono text-fg-muted tabular-nums">
                  {new Date(inc.triggered_at).toLocaleString([], {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </td>
                <td className="px-5 py-3 font-mono text-fg-muted tabular-nums">{responseTime(inc.triggered_at)}</td>
                <td className="px-5 py-3">
                  <StatusLight status={inc.status} />
                </td>
                <td className="px-5 py-3 relative">
                  <button
                    onClick={() => setOpenMenuId(openMenuId === inc.id ? null : inc.id)}
                    className="text-accent font-semibold text-[12px] flex items-center gap-1"
                  >
                    Detailed Report <span className="text-fg-subtle">›</span>
                  </button>
                  {openMenuId === inc.id && (
                    <div className="absolute z-10 mt-1 dash-card py-1 w-44 text-[12px]">
                      <p className="px-3 py-2 text-fg-muted">
                        Confidence: <span className="font-mono text-fg">{inc.confidence ?? "—"}%</span>
                      </p>
                      <p className="px-3 py-2 text-fg-muted border-t border-border-subtle">Context menu</p>
                    </div>
                  )}
                </td>
                <td className="px-5 py-3">
                  <MiniBar
                    label={inc.source}
                    value={inc.confidence ?? 40}
                    color={SEVERITY_COLOR[inc.severity] || "var(--color-accent)"}
                  />
                </td>
                <td className="px-5 py-3">
                  <MiniBar
                    label={`${inc.confidence ?? "—"}% confidence`}
                    value={inc.confidence ?? 40}
                    color="var(--color-accent)"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
