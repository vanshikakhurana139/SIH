import Environment3D from "./Environment3D";
import LiveSignals from "./LiveSignals";
import AiInterpretation from "./AiInterpretation";
import RecommendedResponse from "./RecommendedResponse";
import IncidentImpact from "./IncidentImpact";
import AskSystemChat from "../AskSystemChat";
import TrustScorePanel from "../TrustScorePanel";
import StatCards from "../StatCards";
import CrossExaminationPanel from "../CrossExaminationPanel";

function ActiveIncidentHero({ incident, onManualEscalate }) {
  const sevColor = {
    critical: "#B84040",
    high: "#C0562A",
    medium: "#B07B2E",
    low: "#2D6A9E",
  }[incident?.severity] || "var(--color-fg-subtle)";

  if (!incident) {
    return (
      <div className="mb-2 p-6 sm:p-8 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Click on a Simulation in Config panel for Demo
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            System Telemetry Status
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="live-dot w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: "#2D7A5A", display: "inline-block" }} />
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-black text-slate-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
              All Systems Nominal
            </h2>
            <p className="text-base font-semibold text-slate-500 mt-1">
              No active incidents detected across monitored subsystems. Simulate a sensor anomaly to test AI orchestration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const systemName = incident.source?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) || "Unknown System";
  const isEscalated = incident.escalation_level === 1;

  return (
    <div className={`mb-2 p-6 sm:p-8 rounded-3xl border shadow-sm relative overflow-hidden transition-all ${
      isEscalated ? "bg-purple-50/70 border-purple-300 ring-2 ring-purple-400/30" : "bg-white/90 border-slate-200/80"
    }`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest border"
              style={{ background: `${sevColor}12`, color: sevColor, borderColor: `${sevColor}30` }}
            >
              <span className="w-2 h-2 rounded-full animate-critical" style={{ backgroundColor: sevColor, display: "inline-block" }} />
              {(incident.severity || "").toUpperCase()} SEVERITY INCIDENT
            </span>

            {isEscalated ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-600 text-white shadow-xs animate-pulse">
                <span>🚨</span> ESCALATED TO OPERATIONS HEAD
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                <span>📱</span> ALERT SENT TO SHIFT OPERATOR'S PHONE
              </span>
            )}
          </div>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight" style={{ letterSpacing: "-0.02em" }}>
            {systemName}
          </h2>
          <p className="text-base font-semibold text-slate-600 mt-2 max-w-2xl">{incident.evidence}</p>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-semibold">
            <span className="font-mono text-slate-500">
              Triggered: {new Date(incident.triggered_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-700">
              Assigned Handler: <strong className={isEscalated ? "text-purple-800" : "text-amber-800"}>{incident.assigned_operator_name || "Marcus Vance"}</strong>
              <span className="ml-1 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700">
                {incident.assigned_operator_role === "ops_head" ? "Tier 2 · Ops Head" : "Tier 1 · Shift Op"}
              </span>
            </span>
            {!isEscalated && onManualEscalate && (
              <button
                onClick={() => onManualEscalate(incident.id)}
                className="px-2.5 py-1 rounded-lg bg-purple-100 hover:bg-purple-600 hover:text-white text-purple-900 border border-purple-300 text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer"
              >
                ⚡ Escalate to Ops Head Now
              </button>
            )}
          </div>
        </div>

        {/* Highlight Stats Block */}
        <div className="shrink-0 grid grid-cols-2 gap-4 bg-slate-50/80 border border-slate-200/80 p-5 rounded-2xl min-w-[260px]">
          {[
            { label: "AI Confidence", value: `${incident.confidence}%` },
            { label: "Escalation Tier", value: isEscalated ? "Tier 2 (Ops Head)" : "Tier 1 (Shift Op)" },
            { label: "Matched Rule", value: incident.rule_id },
            { label: "Assigned To", value: incident.assigned_operator_name ? incident.assigned_operator_name.split(" ")[0] : "Operator" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
              <p className="text-[10.5px] uppercase tracking-wider font-extrabold text-slate-400">{label}</p>
              <p className="text-base font-mono font-bold text-slate-900 mt-0.5 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OverviewTab({
  activeIncident, trustScores, healthCheck, stats, scenario,
  onApprove, onReject, onModify, onUndo, onManualEscalate, notice, loadError,
}) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 space-y-8 max-w-[1700px] mx-auto">

          {/* Notice / error banners */}
          {notice && (
            <div className="px-5 py-4 rounded-2xl text-sm font-semibold border shadow-xs" style={{ background: "rgba(184,150,62,0.08)", borderColor: "rgba(184,150,62,0.25)", color: "#7A5E1A" }}>
              {notice}
            </div>
          )}
          {loadError && (
            <div className="px-5 py-4 rounded-2xl text-sm font-semibold border shadow-xs" style={{ background: "rgba(184,64,64,0.08)", borderColor: "rgba(184,64,64,0.25)", color: "#B84040" }}>
              {loadError}
            </div>
          )}

          {/* Active Incident Hero Banner */}
          <ActiveIncidentHero incident={activeIncident} onManualEscalate={onManualEscalate} />

          {/* Stat Cards Row */}
          <div>
            <StatCards stats={stats} />
          </div>

          {/* Main 12-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* LEFT / MAIN PANEL — 8 columns on desktop (Higher Priority) */}
            <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">
              <Environment3D scenario={scenario} incident={activeIncident} />
              <RecommendedResponse
                incident={activeIncident}
                onApprove={onApprove}
                onReject={onReject}
                onModify={onModify}
                onUndo={onUndo}
              />
              {/* Feature A: Adversarial Consensus Engine ("Red Team") */}
              <CrossExaminationPanel incident={activeIncident} />
              <AskSystemChat incident={activeIncident} />
            </div>

            {/* RIGHT / SIDE PANEL — 4 columns on desktop */}
            <div className="lg:col-span-4 flex flex-col gap-8 min-w-0">
              <AiInterpretation incident={activeIncident} />
              <LiveSignals incident={activeIncident} scenario={scenario} />
              <TrustScorePanel trustScores={trustScores} />
              <IncidentImpact incident={activeIncident} scenario={scenario} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
