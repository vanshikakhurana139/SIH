import { useState } from "react";

export default function RecommendedResponse({ incident, onApprove, onReject, onModify, onUndo }) {
  const [showModify, setShowModify] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(incident?.recommended_action || "");
  const [confirmedOnce, setConfirmedOnce] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [prevId, setPrevId] = useState(incident?.id);

  if (incident?.id !== prevId) {
    setPrevId(incident?.id);
    setConfirmedOnce(false);
    setShowModify(false);
    setModifiedAction(incident?.recommended_action || "");
  }

  if (!incident) {
    return (
      <div className="ivory-card p-6 text-center" style={{ minHeight: 180 }}>
        <p className="text-[13px] font-semibold text-fg-muted">No recommendation available</p>
        <p className="text-[11px] text-fg-subtle mt-1">Trigger an incident to see the AI recommendation</p>
      </div>
    );
  }

  const status = incident.status || "diagnosed";
  const needsConfirm = incident.severity === "high" || incident.severity === "critical" || !incident.reversible;
  const isPending = status === "diagnosed" || status === "pending_approval";

  function handleApprove() {
    if (needsConfirm && !confirmedOnce) { setConfirmedOnce(true); return; }
    onApprove(incident.id, needsConfirm);
  }

  return (
    <div className="ivory-card overflow-hidden">
      <div className="p-5 border-b border-border-subtle">
        <p className="dash-eyebrow mb-3">Recommended Response</p>

        {/* Action text */}
        <div
          className="rounded-xl p-4 mb-4"
          style={{ background: "rgba(184,150,62,0.06)", border: "1px solid rgba(184,150,62,0.15)" }}
        >
          <p className="text-[13px] text-fg font-medium leading-relaxed">
            {incident.recommended_action}
          </p>
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Risk Reduction", value: "82%",       color: "#2D7A5A" },
            { label: "Recovery Window", value: "12–18 min", color: "var(--color-fg-muted)" },
            { label: "Exposure Avoided", value: "$8,400",   color: "#2D7A5A" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center rounded-xl py-2.5 px-2" style={{ background: "rgba(26,22,18,0.03)", border: "1px solid rgba(180,160,120,0.10)" }}>
              <p className="text-[9px] uppercase tracking-wider font-bold text-fg-subtle mb-1">{label}</p>
              <p className="text-[13px] font-bold font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Crystal Ball */}
        {incident.crystal_ball && (
          <div className="space-y-1.5 mb-4">
            <div className="flex items-start gap-2 text-[11px]">
              <span className="text-positive font-bold shrink-0" style={{ color: "#2D7A5A" }}>✓ If approved:</span>
              <span className="text-fg-muted">{incident.crystal_ball.if_approved}</span>
            </div>
            <div className="flex items-start gap-2 text-[11px]">
              <span className="font-bold shrink-0" style={{ color: "#B84040" }}>⚠ If ignored:</span>
              <span className="text-fg-muted">{incident.crystal_ball.if_ignored}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      {isPending && !showModify && (
        <div className="flex items-center gap-2 p-4 bg-white/60">
          <button
            onClick={handleApprove}
            id="action-approve"
            className="flex-1 py-2.5 px-4 rounded-xl text-[12px] font-bold text-white transition-all flex items-center justify-center gap-2"
            style={{
              background: needsConfirm && !confirmedOnce
                ? "linear-gradient(135deg,#B84040,#D45050)"
                : "linear-gradient(135deg,#B8963E,#D4AF70)",
              boxShadow: needsConfirm && !confirmedOnce
                ? "0 3px 12px rgba(184,64,64,0.30)"
                : "0 3px 12px rgba(184,150,62,0.30)",
            }}
          >
            {needsConfirm && !confirmedOnce ? "⚠ Confirm — High Risk Action" : "Execute Response"}
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </button>
          <button
            onClick={() => { setShowEvidence(!showEvidence); }}
            id="action-evidence"
            className="px-3 py-2.5 rounded-xl text-[12px] font-bold border border-border-subtle bg-white/80 hover:bg-white text-fg-muted hover:text-fg transition-all"
          >
            View Evidence
          </button>
          <button
            onClick={() => setShowModify(true)}
            id="action-modify"
            className="px-3 py-2.5 rounded-xl text-[12px] font-bold border border-border-subtle bg-white/80 hover:bg-white text-fg-muted hover:text-fg transition-all"
          >
            Modify
          </button>
          <button
            onClick={() => onReject(incident.id)}
            id="action-reject"
            className="px-3 py-2.5 rounded-xl text-[12px] font-bold border border-critical/25 bg-critical/5 hover:bg-critical/10 transition-all"
            style={{ color: "#B84040", borderColor: "rgba(184,64,64,0.25)" }}
          >
            Reject
          </button>
        </div>
      )}

      {showModify && (
        <div className="p-4 bg-white/60 space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-fg-subtle">Modify Action</p>
          <textarea
            className="w-full bg-white border border-border-subtle rounded-xl p-3 text-[12px] text-fg font-mono focus:outline-none focus:border-gold transition-all"
            style={{ "--tw-ring-color": "rgba(184,150,62,0.2)" }}
            rows={3}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => { setShowModify(false); onModify(incident.id, modifiedAction); }}
              className="flex-1 gold-btn py-2 text-[12px] font-bold"
            >Submit</button>
            <button
              onClick={() => setShowModify(false)}
              className="px-4 py-2 rounded-xl text-[12px] font-bold border border-border-subtle bg-white text-fg-muted"
            >Cancel</button>
          </div>
        </div>
      )}

      {!isPending && !showModify && (
        <div className="px-5 py-3 bg-white/50 flex items-center justify-between">
          <p className="text-[11px] font-mono text-fg-muted">
            Decision: <span className="font-bold" style={{ color: "var(--color-gold)" }}>{status.toUpperCase()}</span>
          </p>
          {(status === "resolved" || status === "failed") && incident.reversible && (
            <button
              onClick={() => onUndo(incident.id)}
              className="text-[11px] font-bold border border-border-subtle px-3 py-1 rounded-xl hover:bg-red-50 transition-all"
              style={{ color: "#B84040", borderColor: "rgba(184,64,64,0.25)" }}
            >
              Undo Action
            </button>
          )}
        </div>
      )}

      {/* Evidence expand */}
      {showEvidence && incident.rollback_plan && (
        <div className="px-5 py-4 border-t border-border-subtle bg-ivory/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-fg-subtle mb-2">Rollback Strategy</p>
          <ul className="space-y-1">
            {incident.rollback_plan.map((step, i) => (
              <li key={i} className="text-[11px] text-fg-muted pl-3 border-l-2 border-positive/40 font-mono" style={{ borderColor: "rgba(45,122,90,0.4)" }}>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
