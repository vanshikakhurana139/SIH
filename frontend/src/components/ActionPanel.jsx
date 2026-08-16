import { useState } from "react";
import { IconCheckCircle, IconSettings, IconXCircle } from "../icons";

export default function ActionPanel({ incident, onApprove, onReject, onModify, onUndo }) {
  const [showModify, setShowModify] = useState(false);
  const [modifiedAction, setModifiedAction] = useState(incident?.recommended_action || "");
  const [confirmedOnce, setConfirmedOnce] = useState(false);

  const actionable = incident && ["diagnosed", "pending_approval"].includes(incident.status);
  const needsExtraConfirm =
    incident && (incident.severity === "high" || incident.severity === "critical" || !incident.reversible);

  function handleApprove() {
    if (needsExtraConfirm && !confirmedOnce) {
      setConfirmedOnce(true);
      return;
    }
    onApprove(incident.id, !!needsExtraConfirm);
    setConfirmedOnce(false);
  }

  function handleModifyClick() {
    setModifiedAction(incident?.recommended_action || "");
    setShowModify(true);
  }

  function submitModify() {
    onModify(incident.id, modifiedAction);
    setShowModify(false);
  }

  const canUndo = incident && ["resolved", "failed"].includes(incident.status) && incident.reversible;

  return (
    <div className="dash-card px-5 py-5">
      <p className="dash-eyebrow">Action Buttons</p>
      <p className="text-[13px] font-semibold text-fg mt-0.5 mb-4">Incident Controls</p>

      {!incident && <p className="text-[12px] text-fg-subtle">No active incident to act on.</p>}

      {incident && !showModify && (
        <div className="space-y-2.5">
          <button
            disabled={!actionable}
            onClick={handleApprove}
            className="w-full flex items-center justify-center gap-2 bg-fg text-white text-[13px] font-bold py-2.5 rounded-xl transition-opacity disabled:opacity-40"
          >
            <IconCheckCircle width={15} height={15} />
            {needsExtraConfirm && !confirmedOnce && actionable ? "Confirm Approve" : "Approve"}
          </button>
          <button
            disabled={!actionable}
            onClick={handleModifyClick}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-fg text-[13px] font-bold py-2.5 rounded-xl hover:border-fg-subtle transition-colors disabled:opacity-40"
          >
            <IconSettings width={15} height={15} />
            Modify
          </button>
          <button
            disabled={!actionable}
            onClick={() => onReject(incident.id)}
            className="w-full flex items-center justify-center gap-2 bg-surface border border-border text-fg text-[13px] font-bold py-2.5 rounded-xl hover:border-severity-critical hover:text-severity-critical transition-colors disabled:opacity-40"
          >
            <IconXCircle width={15} height={15} />
            Reject
          </button>

          {canUndo && (
            <button
              onClick={() => onUndo(incident.id)}
              className="w-full text-[12px] font-semibold text-fg-muted border border-border rounded-xl py-2 hover:border-severity-critical hover:text-severity-critical transition-colors"
            >
              Undo Action
            </button>
          )}
        </div>
      )}

      {incident && showModify && (
        <div className="space-y-2.5">
          <textarea
            className="w-full bg-surface border border-border rounded-xl p-3 text-[12px] text-fg font-mono focus:border-accent transition-colors"
            rows={5}
            value={modifiedAction}
            onChange={(e) => setModifiedAction(e.target.value)}
          />
          <button
            onClick={submitModify}
            className="w-full bg-fg text-white text-[13px] font-bold py-2.5 rounded-xl"
          >
            Submit Modified Action
          </button>
          <button
            onClick={() => setShowModify(false)}
            className="w-full bg-surface border border-border text-fg-muted text-[13px] font-bold py-2.5 rounded-xl"
          >
            Cancel
          </button>
        </div>
      )}

      {incident && !actionable && !showModify && (
        <p className="mt-3 text-[11px] font-mono text-fg-subtle">
          Decision recorded — {incident.status.replace(/_/g, " ")}
        </p>
      )}
    </div>
  );
}
