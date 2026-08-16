import Gauge from "./Gauge";
import { SeverityLight } from "./StatusLight";
import { IconAlertTriangle, IconCheckCircle, IconBolt } from "../icons";

export default function EvidencePanel({ incident }) {
  if (!incident) return null;

  const isCritical = incident.severity === "critical" || incident.severity === "high";

  return (
    <div className="space-y-6">
      {/* Header Badge Strip */}
      <div className="flex items-center justify-between pb-4 border-b border-border-subtle/80">
        <div className="flex items-center gap-3">
          <SeverityLight severity={incident.severity} />
          <span className="w-px h-3.5 bg-border-subtle" />
          <span className="font-mono text-xs font-bold text-fg-muted tracking-wide">{incident.rule_id}</span>
        </div>
        <div className="flex items-center gap-2">
          {!incident.reversible && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-red-500/10 text-red-600 border border-red-500/20 shadow-2xs">
              ⚡ Irreversible
            </span>
          )}
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-accent/10 text-accent border border-accent/20">
            Realtime Telemetry
          </span>
        </div>
      </div>

      {/* Sensor Metric Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-bold mb-1">Live Reading</p>
          <p className="font-mono text-lg font-black text-fg tabular-nums leading-none">
            {incident.sensor_value}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-bold mb-1">Safety Threshold</p>
          <p className="font-mono text-lg font-bold text-fg-muted tabular-nums leading-none">
            {incident.threshold}
          </p>
        </div>
        <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-xl p-3.5 shadow-2xs">
          <p className="text-[10px] uppercase tracking-wider text-fg-subtle font-bold mb-1">Sensor Source</p>
          <p className="font-mono text-xs font-bold text-accent truncate leading-none mt-1">
            {incident.source}
          </p>
        </div>
      </div>

      {/* Evidence Banner */}
      <div className={`rounded-r-xl p-3.5 border-l-4 ${isCritical ? "bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent border-red-500" : "bg-gradient-to-r from-accent/5 via-accent/10 to-transparent border-accent"}`}>
        <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 flex items-center gap-1.5 ${isCritical ? "text-red-600" : "text-accent"}`}>
          <IconAlertTriangle width={13} height={13} />
          Diagnostic Evidence
        </p>
        <p className="text-[12.5px] leading-relaxed text-fg font-medium">{incident.evidence}</p>
      </div>

      {/* Confidence Arc Gauge */}
      <div className="bg-white/40 border border-white/60 rounded-2xl p-2 shadow-inner">
        <Gauge value={incident.confidence} />
      </div>

      {/* Recommended Action Box */}
      <div className="bg-white/70 backdrop-blur-md border border-white/90 rounded-2xl p-4 shadow-2xs space-y-2">
        <p className="text-[10.5px] uppercase tracking-widest text-fg-subtle font-extrabold flex items-center gap-1.5">
          <IconBolt width={14} height={14} className="text-accent" />
          Recommended Action Plan
        </p>
        <ol className="space-y-1.5">
          {incident.recommended_action.split("\n").map((line, i) => (
            <li key={i} className="flex items-start gap-2 text.5 flex-1 text-[13px] text-fg font-semibold leading-relaxed">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-accent/15 text-accent text-[10px] font-black shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{line.replace(/^\d+\.\s*/, "")}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Rollback Strategy */}
      {incident.rollback_plan && incident.rollback_plan.length > 0 && (
        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-widest text-fg-subtle font-extrabold mb-2 flex items-center gap-1.5">
            <IconCheckCircle width={13} height={13} className="text-emerald-600" />
            Automated Rollback Strategy
          </p>
          <ul className="space-y-1.5">
            {incident.rollback_plan.map((step, i) => (
              <li
                key={i}
                className="text-[12px] text-fg-muted leading-relaxed pl-3 border-l-2 border-emerald-500/40 font-mono"
              >
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}