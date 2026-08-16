import Environment3D from "./Environment3D";
import LiveSignals from "./LiveSignals";
import AiInterpretation from "./AiInterpretation";
import RecommendedResponse from "./RecommendedResponse";
import IncidentImpact from "./IncidentImpact";
import RecoveryStatus from "./RecoveryStatus";
import AskSystemChat from "../AskSystemChat";
import TrustScorePanel from "../TrustScorePanel";
import StatCards from "../StatCards";

function ActiveIncidentHero({ incident }) {
  const sevColor = {
    critical: "#B84040",
    high: "#C0562A",
    medium: "#B07B2E",
    low: "#2D6A9E",
  }[incident?.severity] || "var(--color-fg-subtle)";

  if (!incident) {
    return (
      <div className="mb-6">
        <p className="dash-eyebrow mb-2">Active Incident</p>
        <div className="flex items-center gap-3">
          <span className="live-dot w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: "#2D7A5A", display: "inline-block" }} />
          <h2 className="font-display text-[36px] text-fg" style={{ letterSpacing: "-0.01em" }}>All Systems Nominal</h2>
        </div>
        <p className="text-[14px] text-fg-muted mt-1">No active incidents. Simulate a sensor reading to test the AI workflow.</p>
      </div>
    );
  }

  const systemName = incident.source?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Unknown System";

  return (
    <div className="mb-6">
      <p className="dash-eyebrow mb-2">Active Incident</p>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-[40px] text-fg leading-tight" style={{ letterSpacing: "-0.01em" }}>
            {systemName}
          </h2>
          <p className="text-[14px] text-fg-muted mt-1">{incident.evidence?.substring(0, 80)}…</p>
          <div className="flex items-center gap-3 mt-3">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border"
              style={{ background: `${sevColor}12`, color: sevColor, borderColor: `${sevColor}30` }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-critical" style={{ backgroundColor: sevColor, display: "inline-block" }} />
              {(incident.severity || "").toUpperCase()}
            </span>
            <span className="text-[11px] font-mono text-fg-subtle">{incident.id}</span>
            <span className="text-[11px] font-mono text-fg-subtle">
              Since {new Date(incident.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        <div className="shrink-0 grid grid-cols-2 gap-x-6 gap-y-1 text-right">
          {[
            { label: "Confidence", value: `${incident.confidence}%` },
            { label: "Escalation Prob.", value: "82%" },
            { label: "Rule Match", value: incident.rule_id },
            { label: "Affected System", value: incident.source },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9.5px] uppercase tracking-wider font-bold text-fg-subtle">{label}</p>
              <p className="text-[13px] font-mono font-bold text-fg">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({
  activeIncident, incidents, trustScores, healthCheck, stats, scenario,
  onApprove, onReject, onModify, onUndo, notice, loadError,
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">

          {/* Notice / error */}
          {notice && (
            <div className="mb-4 px-4 py-3 rounded-xl text-[12px] font-medium border" style={{ background: "rgba(184,150,62,0.06)", borderColor: "rgba(184,150,62,0.20)", color: "var(--color-fg-muted)" }}>
              {notice}
            </div>
          )}
          {loadError && (
            <div className="mb-4 px-4 py-3 rounded-xl text-[12px] font-medium border" style={{ background: "rgba(184,64,64,0.06)", borderColor: "rgba(184,64,64,0.22)", color: "#B84040" }}>
              {loadError}
            </div>
          )}

          {/* Active incident hero */}
          <ActiveIncidentHero incident={activeIncident} />

          {/* Stat Cards strip */}
          <div className="mb-6">
            <StatCards stats={stats} />
          </div>

          {/* Main 3-column layout */}
          <div className="flex gap-5">
            {/* LEFT — 3D + Signals */}
            <div className="flex-1 min-w-0 flex flex-col gap-5">
              <Environment3D scenario={scenario} incident={activeIncident} />
              <LiveSignals incident={activeIncident} scenario={scenario} />
              {/* Ask Reasoning Engine */}
              <AskSystemChat incident={activeIncident} />
            </div>

            {/* CENTER — AI + Response */}
            <div className="w-[300px] shrink-0 flex flex-col gap-5">
              <AiInterpretation incident={activeIncident} />
              <RecommendedResponse
                incident={activeIncident}
                onApprove={onApprove}
                onReject={onReject}
                onModify={onModify}
                onUndo={onUndo}
              />
            </div>

            {/* RIGHT — Impact + Recovery + Trust */}
            <div className="w-[240px] shrink-0 flex flex-col gap-5">
              <IncidentImpact incident={activeIncident} />
              <RecoveryStatus healthCheck={healthCheck} />
              <TrustScorePanel trustScores={trustScores} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
