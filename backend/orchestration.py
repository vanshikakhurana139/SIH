"""
Runs after a human clicks Approve. This is intentionally a MOCKED sequence
— no real infrastructure, no external calls — but every step is logged to
the tamper-evident Audit Log so the sequence looks and behaves like a real
orchestration pipeline for demo purposes.
"""
import hashlib
from database import append_audit_log, record_outcome

# Same operator map as rule_engine.py, used here to re-check the sensor
import operator
OPERATORS = {">": operator.gt, "<": operator.lt, "==": operator.eq}


def _deterministic_outcome(incident: dict) -> bool:
    """
    No forced outcome given — decide success probabilistically, weighted by
    a confidence score. Deterministic (same incident always gives the same
    result) so the demo is repeatable, not random.

    Phase 1 (Red Team) wiring: if this incident has been cross-examined,
    consensus_confidence — the score that has already survived a logged
    Advocate/Skeptic rebuttal — is used instead of the raw Confidence Score.
    This is what "gates the autonomy boundary on a score that has survived
    scrutiny" means in practice: it is the value that decides whether this
    action counts as a success for the Trust Score. Falls back to the raw
    confidence when cross-examination hasn't run yet, so nothing breaks.
    """
    roll = int(hashlib.md5(incident["id"].encode()).hexdigest(), 16) % 100
    effective_confidence = incident.get("consensus_confidence")
    if effective_confidence is None:
        effective_confidence = incident["confidence"]
    return roll < effective_confidence


def execute_action(incident: dict, rule: dict, force_outcome: str | None = None) -> dict:
    """
    Runs the mocked multi-step action, then the Post-Action Health Check,
    then updates the Trust Score. Returns the fully updated incident.
    force_outcome: "success" | "fail" | None (None = deterministic by confidence)
    """
    updated = dict(incident)

    # Step 1 — log execution start with the plan
    append_audit_log(updated["id"], "execution_started", {
        "steps": rule["suggested_actions"],
    })

    # Step 2 — simulate the sensor moving as a result of the action.
    # Move the value halfway back toward a safe zone (crude but explainable).
    old_value = updated["sensor_value"]
    threshold = updated["threshold"]
    simulated_new_value = old_value - ((old_value - threshold) * 0.6) if old_value > threshold else \
                           old_value + ((threshold - old_value) * 0.6)

    append_audit_log(updated["id"], "execution_completed", {
        "sensor_value_before": old_value,
        "sensor_value_after": round(simulated_new_value, 2),
    })

    # Step 3 — Post-Action Health Check
    if force_outcome == "success":
        success = True
    elif force_outcome == "fail":
        success = False
    else:
        success = _deterministic_outcome(updated)

    # Health check re-applies the ORIGINAL rule condition to the NEW value.
    # If the new value no longer breaches, the incident is genuinely resolved.
    compare = OPERATORS[rule["operator"]]
    actually_safe = not compare(simulated_new_value, threshold)

    # Trust the health check's real math over the forced/deterministic flag
    # only when they disagree in the "looks safe but we forced fail" direction —
    # for a hackathon demo we let force_outcome win, since it exists for testing.
    final_success = success if force_outcome else (success and actually_safe)

    updated["sensor_value"] = round(simulated_new_value, 2)
    updated["status"] = "resolved" if final_success else "failed"

    append_audit_log(updated["id"], "health_check", {
        "result": "success" if final_success else "failed",
        "sensor_value_checked": updated["sensor_value"],
        "threshold": threshold,
    })

    # Step 4 — Trust Score updates ONLY here, never on approval alone
    record_outcome(rule["rule_id"], final_success)

    return updated


def undo_action(incident: dict, rule: dict) -> dict:
    """Reverses a completed action using the rollback_plan from Phase 2."""
    updated = dict(incident)

    if not updated.get("reversible", False):
        raise ValueError("This action is not reversible and cannot be undone.")

    append_audit_log(updated["id"], "undo_started", {
        "rollback_steps": updated["rollback_plan"],
    })

    updated["status"] = "undone"

    append_audit_log(updated["id"], "undo_completed", {
        "note": "Action manually undone by operator.",
    })

    # An undo means the original action's success doesn't really count —
    # penalize this rule's trust score by recording it as an unsuccessful outcome.
    record_outcome(rule["rule_id"], success=False)

    return updated