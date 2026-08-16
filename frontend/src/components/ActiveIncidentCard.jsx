import { useState } from "react";
import EvidencePanel from "./EvidencePanel";
import CrystalBall from "./CrystalBall";
import { StatusLight } from "./StatusLight";
import { IconArrow, IconAlertTriangle } from "../icons";

export default function ActiveIncidentCard({ incident, onApprove, onReject, onModify, onUndo }) {
  const [showModify, setShowModify] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(incident?.recommended_action || "");
  const [confirmedOnce, setConfirmedOnce] = useState(false);
  const [prevIncidentId, setPrevIncidentId] = useState(incident?.id);

  if (incident?.id !== prevIncidentId) {
    setPrevIncidentId(incident?.id);
    setConfirmedOnce(false);
    setShowModify(false);
    setModifiedAction(incident?.recommended_action || "");
  }

  if (!incident) {
    return (
      <div className="dash-card p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3 animate-pulse">
          <IconAlertTriangle width={24} height={24} />
        </div>
        <h3 className="font-display font-bold text-fg text-base">All Systems Nominal</h3>
        <p className="text-xs text-fg-subtle mt-1 max-w-sm">No active incident requires attention. Use the simulation controls above to test real-time AI Orchestration.</p>
      </div>
    );
  }

  const status = incident.status || "pending_approval";
  const needsExtraConfirm =
    incident.severity === "high" || incident.severity === "critical" || !incident.reversible;

  function handleApprove() {
    if (needsExtraConfirm && !confirmedOnce) {
      setConfirmedOnce(true);
      return;
    }
    onApprove(incident.id, needsExtraConfirm ? true : false);
  }

  function handleReject() {
    onReject(incident.id);
  }

  function handleModifySubmit() {
    setShowModify(false);
    onModify(incident.id, modifiedAction);
  }

  return (
    <div className={`dash-card overflow-hidden transition-all duration-300 ${needsExtraConfirm ? "incident-active-border border-red-400/50" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle/80 bg-white/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="live-dot bg-accent" />
            <p className="text-[10px] uppercase tracking-widest text-fg-subtle font-extrabold">Active Incident</p>
          </div>
          <p className="font-mono text-xs font-bold text-fg mt-0.5 tracking-tight">{incident.id}</p>
        </div>
        <StatusLight status={status} />
      </div>

      {/* Main Body */}
      <div className="p-6 space-y-6">
        <EvidencePanel incident={incident} />
        <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent my-6" />
        <CrystalBall crystalBall={incident.crystal_ball} />
      </div>

      {/* Action Bar */}
      {(status === "diagnosed" || status === "pending_approval") && !showModify && (
        <div className="flex items-center gap-3 px-6 py-4 border-t border-border-subtle bg-white/60 backdrop-blur-md">
          <button
            onClick={handleApprove}
            className={`flex-1 inline-flex items-center justify-center gap-2 text-[13px] font-extrabold py-3 px-5 rounded-xl transition-all duration-200 shadow-md transform hover:-translate-y-0.5 active:translate-y-0 ${
              needsExtraConfirm && !confirmedOnce
                ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-red-500/20"
                : "bg-gradient-to-r from-accent to-accent-light hover:from-accent hover:to-accent text-white shadow-accent/25"
            }`}
          >
            {needsExtraConfirm && !confirmedOnce ? "⚠️ Confirm — High Risk Action" : "Approve Action"}
            <IconArrow width={14} height={14} />
          </button>
          <button
            onClick={() => setShowModify(true)}
            className="px-4 py-3 rounded-xl text-[13px] font-bold text-fg-muted border border-border bg-white/80 hover:bg-white hover:text-fg hover:border-accent transition-all shadow-2xs"
          >
            Modify
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-3 rounded-xl text-[13px] font-bold text-red-600 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all shadow-2xs"
          >
            Reject
          </button>
        </div>
      )}

      {showModify && (
        <div className="px-6 py-5 border-t border-border-subtle bg-white/60 backdrop-blur-md space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-fg-subtle">Modify Recommended Action</p>
          <textarea
            className="w-full bg-white border border-border rounded-xl p-3.5 text-[13px] text-fg font-mono focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all outline-none"
            rows={4}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleModifySubmit}
              className="flex-1 bg-accent hover:bg-accent/90 text-white text-[13px] font-bold py-2.5 rounded-xl transition-all shadow-md"
            >
              Submit Modified Action
            </button>
            <button
              onClick={() => setShowModify(false)}
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-fg-muted border border-border bg-white hover:text-fg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status !== "diagnosed" && status !== "pending_approval" && !showModify && (
        <div className="px-6 py-3.5 border-t border-border-subtle bg-white/50 flex items-center justify-between">
          <p className="text-[12px] font-mono text-fg-muted">
            Decision Recorded: <span className="font-bold text-accent uppercase">{status}</span>
          </p>
        </div>
      )}

      {(status === "resolved" || status === "failed") && incident.reversible && (
        <div className="px-6 py-3 border-t border-border-subtle bg-white/50 flex justify-end">
          <button
            onClick={() => onUndo(incident.id)}
            className="text-[12px] font-bold text-red-600 border border-red-500/30 hover:bg-red-500/10 px-4 py-1.5 rounded-xl transition-all"
          >
            Undo Action
          </button>
        </div>
      )}
    </div>
  );
}