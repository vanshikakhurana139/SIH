import Gauge from "./Gauge";
import { SeverityLight } from "./StatusLight";

export default function EvidencePanel({ incident }) {
  if (!incident) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
        <SeverityLight severity={incident.severity} />
        <span className="w-px h-3 bg-border" />
        <span className="font-mono text-xs text-fg-muted">{incident.rule_id}</span>
        {!incident.reversible && (
          <>
            <span className="w-px h-3 bg-border" />
            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-severity-critical">
              Irreversible
            </span>
          </>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1">Reading</p>
          <p className="font-mono text-sm text-fg tabular-nums">{incident.sensor_value}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1">Threshold</p>
          <p className="font-mono text-sm text-fg-muted tabular-nums">{incident.threshold}</p>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1">Source</p>
          <p className="font-mono text-sm text-fg truncate">{incident.source}</p>
        </div>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1.5">Evidence</p>
        <p className="text-[13px] leading-relaxed text-fg-muted">{incident.evidence}</p>
      </div>

      <Gauge value={incident.confidence} />

      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1.5">
          Recommended Action
        </p>
        <ol className="list-decimal list-inside space-y-1 marker:text-fg-subtle marker:font-mono marker:text-[12px]">
          {incident.recommended_action.split("\n").map((line, i) => (
            <li key={i} className="text-[13px] text-fg leading-relaxed">
              {line.replace(/^\d+\.\s*/, "")}
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.08em] text-fg-subtle mb-1.5">
          Rollback Plan
        </p>
        <ul className="space-y-1.5">
          {incident.rollback_plan.map((step, i) => (
            <li
              key={i}
              className="text-[13px] text-fg-muted leading-relaxed pl-3 border-l border-border"
            >
              {step}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}