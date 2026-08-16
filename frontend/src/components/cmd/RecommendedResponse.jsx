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
      <div className="ivory-card p-8 rounded-3xl border border-slate-200/80 shadow-sm bg-white/90 text-center min-h-[200px] flex flex-col items-center justify-center">
        <p className="text-base font-bold text-slate-800">No Recommendation Available</p>
        <p className="text-xs text-slate-500 mt-1">Trigger an incident from the control panel to view AI recommendation</p>
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
    <div className="ivory-card rounded-3xl border border-slate-200/80 shadow-sm bg-white/90 overflow-hidden">
      <div className="p-6 sm:p-7 border-b border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            Recommended Action
          </span>
          <span className="text-xs font-mono font-bold text-slate-400">PRIORITY RESPONSE</span>
        </div>

        {/* Action text */}
        <div
          className="rounded-2xl p-4.5 mb-5 border-l-4 shadow-2xs"
          style={{ background: "rgba(184,150,62,0.06)", borderColor: "#B8963E" }}
        >
          <p className="text-base text-slate-900 font-bold leading-relaxed">
            {incident.recommended_action}
          </p>
        </div>

        {/* Impact metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: "Risk Reduction", value: "82%", color: "#2D7A5A" },
            { label: "Recovery Window", value: "12–18 min", color: "#475569" },
            { label: "Exposure Avoided", value: "$8,400", color: "#2D7A5A" },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center rounded-2xl py-3 px-2 bg-slate-50/80 border border-slate-200/70">
              <p className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">{label}</p>
              <p className="text-sm font-bold font-mono" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Crystal Ball */}
        {incident.crystal_ball && (
          <div className="space-y-2 mb-2 p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60">
            <div className="flex items-start gap-2.5 text-xs font-medium">
              <span className="text-emerald-700 font-extrabold shrink-0">✓ If Approved:</span>
              <span className="text-slate-700 font-semibold">{incident.crystal_ball.if_approved}</span>
            </div>
            <div className="flex items-start gap-2.5 text-xs font-medium">
              <span className="font-extrabold shrink-0 text-rose-700">⚠ If Ignored:</span>
              <span className="text-slate-700 font-semibold">{incident.crystal_ball.if_ignored}</span>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      {isPending && !showModify && (
        <div className="flex flex-wrap items-center gap-3 p-5 bg-slate-50/80 border-t border-slate-100">
          <button
            onClick={handleApprove}
            id="action-approve"
            className="flex-1 py-3.5 px-5 rounded-2xl text-sm font-extrabold text-white transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            style={{
              background: needsConfirm && !confirmedOnce
                ? "linear-gradient(135deg,#B84040,#D45050)"
                : "linear-gradient(135deg,#B8963E,#D4AF70)",
              boxShadow: needsConfirm && !confirmedOnce
                ? "0 4px 14px rgba(184,64,64,0.30)"
                : "0 4px 14px rgba(184,150,62,0.30)",
            }}
          >
            {needsConfirm && !confirmedOnce ? "⚠ Confirm High-Risk Action" : "Execute AI Response"}
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 8h10M8 3l5 5-5 5" />
            </svg>
          </button>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => { setShowEvidence(!showEvidence); }}
              id="action-evidence"
              className="px-4 py-3 rounded-2xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs"
            >
              Evidence
            </button>
            <button
              onClick={() => setShowModify(true)}
              id="action-modify"
              className="px-4 py-3 rounded-2xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all shadow-2xs"
            >
              Modify
            </button>
            <button
              onClick={() => onReject(incident.id)}
              id="action-reject"
              className="px-4 py-3 rounded-2xl text-xs font-bold border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 transition-all shadow-2xs"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {showModify && (
        <div className="p-5 bg-slate-50/80 space-y-3 border-t border-slate-100">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Modify Recommended Action</p>
          <textarea
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs font-semibold text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-2xs"
            rows={3}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <div className="flex gap-3">
            <button
              onClick={() => { setShowModify(false); onModify(incident.id, modifiedAction); }}
              className="flex-1 gold-btn py-2.5 text-xs font-extrabold rounded-2xl"
            >Submit Modification</button>
            <button
              onClick={() => setShowModify(false)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold border border-slate-200 bg-white text-slate-600"
            >Cancel</button>
          </div>
        </div>
      )}

      {!isPending && !showModify && (
        <div className="px-6 py-4 bg-slate-50/80 flex items-center justify-between border-t border-slate-100">
          <p className="text-xs font-mono text-slate-600">
            Status: <span className="font-extrabold text-amber-700">{status.toUpperCase()}</span>
          </p>
          {(status === "resolved" || status === "failed") && incident.reversible && (
            <button
              onClick={() => onUndo(incident.id)}
              className="text-xs font-bold border border-rose-200 px-4 py-2 rounded-2xl hover:bg-rose-50 transition-all text-rose-700"
            >
              Undo Action
            </button>
          )}
        </div>
      )}

      {/* Evidence expand */}
      {showEvidence && incident.rollback_plan && (
        <div className="px-6 py-5 border-t border-slate-200/80 bg-slate-50/50">
          <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3">Rollback Strategy</p>
          <ul className="space-y-2">
            {incident.rollback_plan.map((step, i) => (
              <li key={i} className="text-xs text-slate-700 pl-3 border-l-2 border-emerald-500/60 font-mono font-semibold">
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
