import { useState } from "react";
import EvidencePanel from "./EvidencePanel";
import CrystalBall from "./CrystalBall";
import { StatusLight } from "./StatusLight";
import { IconArrow } from "../icons";

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
      <div className="bg-surface border border-border-subtle rounded-2xl p-6 shadow-sm">
        <p className="text-sm text-fg-subtle">No active incident.</p>
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
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
        <div>
          <p className="text-[11px] uppercase tracking-[0.1em] text-fg-subtle font-semibold">Active Incident</p>
          <p className="font-mono text-sm text-fg mt-0.5">{incident.id}</p>
        </div>
        <StatusLight status={status} />
      </div>

      <div className="p-5">
        <EvidencePanel incident={incident} />
        <div className="h-px bg-border-subtle my-5" />
        <CrystalBall crystalBall={incident.crystal_ball} />
      </div>

      {(status === "diagnosed" || status === "pending_approval") && !showModify && (
        <div className="flex items-center gap-2 px-5 py-4 border-t border-border-subtle bg-surface-raised/40">
          <button
            onClick={handleApprove}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-accent hover:bg-accent/90 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors"
          >
            {needsExtraConfirm && !confirmedOnce ? "Confirm — irreversible / high risk" : "Approve"}
            <IconArrow />
          </button>
          <button
            onClick={() => setShowModify(true)}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-fg-muted border border-border hover:border-fg-subtle hover:text-fg transition-colors"
          >
            Modify
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-severity-critical hover:bg-severity-critical/10 transition-colors"
          >
            Reject
          </button>
        </div>
      )}

      {showModify && (
        <div className="px-5 py-4 border-t border-border-subtle bg-surface-raised/40 space-y-3">
          <textarea
            className="w-full bg-surface border border-border rounded-xl p-3 text-[13px] text-fg font-mono focus:border-accent transition-colors"
            rows={4}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleModifySubmit}
              className="flex-1 bg-accent hover:bg-accent/90 text-white text-[13px] font-bold py-2.5 rounded-xl transition-colors"
            >
              Submit modified action
            </button>
            <button
              onClick={() => setShowModify(false)}
              className="px-4 py-2.5 rounded-xl text-[13px] font-bold text-fg-muted border border-border hover:text-fg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {status !== "diagnosed" && status !== "pending_approval" && !showModify && (
        <div className="px-5 py-3 border-t border-border-subtle bg-surface-raised/40">
          <p className="text-[12px] font-mono text-fg-muted">
            Decision recorded — <span className="text-fg">{status}</span>
          </p>
        </div>
      )}

      {(status === "resolved" || status === "failed") && incident.reversible && (
        <div className="px-5 py-3 border-t border-border-subtle bg-surface-raised/40">
          <button
            onClick={() => onUndo(incident.id)}
            className="text-[12px] font-bold text-fg-muted border border-border hover:border-severity-critical hover:text-severity-critical px-3 py-1.5 rounded-xl transition-colors"
          >
            Undo Action
          </button>
        </div>
      )}
    </div>
  );
}