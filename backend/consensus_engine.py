"""
Adversarial Consensus Engine ("Red Team") — Phase 1 of the Wow-Factor roadmap.

Local, deterministic logic only. No external API call is required for the
core mechanism — same design philosophy as reasoning_engine.py, so this
still works with the laptop's Wi-Fi off.

Consensus Confidence formula (documented here for the patent notes, same
pattern as the Confidence formula documented in reasoning_engine.py):

    consensus_confidence = raw_confidence
                            - (PENALTY_PER_RISK_FACTOR * number_of_risk_factors_surfaced)
                            - (PAST_FAILURE_PENALTY if a real past Health Check
                               failure or Undo exists in the Audit Log for this
                               rule_id, else 0)
                            + (HIGH_TRUST_BONUS if the historical success ratio
                               is >= HIGH_TRUST_RATIO_THRESHOLD, else 0)

    - PENALTY_PER_RISK_FACTOR = 4 points per risk factor the Skeptic surfaces
      (at most MAX_RISK_FACTORS_SURFACED are surfaced, so max 8 points off).
    - PAST_FAILURE_PENALTY = 10 points, applied once, only when the Skeptic's
      strongest point is a REAL past failure pulled from the tamper-evident
      Audit Log (not an invented one).
    - HIGH_TRUST_BONUS = +5 points, using the same 0.8 ratio threshold that
      database.py already uses for AUTO_PILOT_MIN_RATIO, so "high trust"
      means the same thing everywhere in the system.
    - Final score is clamped to [0, 99] — same ceiling as the raw
      Confidence Score; we never claim 100% certainty here either.
"""
from templates import (
    build_advocate_track_record,
    build_advocate_no_history,
    build_skeptic_risk_line,
    build_skeptic_no_risk_factor,
)

PENALTY_PER_RISK_FACTOR = 4
MAX_RISK_FACTORS_SURFACED = 2
PAST_FAILURE_PENALTY = 10
HIGH_TRUST_BONUS = 5
HIGH_TRUST_RATIO_THRESHOLD = 0.8


def build_case(incident: dict, rule: dict, trust_score: dict | None = None,
                past_failure: dict | None = None) -> dict:
    """
    Given a diagnosed Incident (output of diagnose_incident) and its matching
    Rule, returns a structured Advocate case, Skeptic case, and Consensus
    Confidence Score — using only local data already on the incident/rule/
    trust_score, no network call.

    trust_score: this rule_id's entry from get_all_trust_scores() (Phase 5),
                 or None if the rule has no trust history yet.
    past_failure: a single Audit Log entry (event_type "health_check" with
                  result "failed", or "undo_completed") for a PAST incident
                  of this same rule_id, or None if no such failure exists.
    """
    raw_confidence = incident["confidence"]
    risk_factors = rule.get("risk_factors", [])
    successful = trust_score["successful_outcomes"] if trust_score else 0
    total = trust_score["total_outcomes"] if trust_score else 0
    ratio = (successful / total) if total > 0 else None

    # ---------- Advocate: builds the strongest case FOR the action ----------
    advocate_case = [
        f"The Evidence Panel shows '{incident['source']}' at {incident['sensor_value']}, "
        f"{round(abs(incident['sensor_value'] - incident['threshold']), 2)} past the "
        f"{incident['threshold']} threshold — a clear, measured breach, not a borderline reading.",
    ]
    if total > 0:
        advocate_case.append(
            build_advocate_track_record(rule["rule_id"], successful, total, incident["id"])
        )
    else:
        advocate_case.append(build_advocate_no_history(rule["rule_id"], incident["id"]))
    advocate_case.append(
        "The recommended action follows a fully reversible, pre-approved rollback plan."
        if rule.get("reversible")
        else f"Although irreversible, this action matches a documented, pre-authorized "
             f"protocol for {incident['severity']}-severity events."
    )

    # ---------- Skeptic: counters with risk factors + real past failures ----------
    surfaced_factors = risk_factors[:MAX_RISK_FACTORS_SURFACED]
    skeptic_case = [
        build_skeptic_risk_line(rf, incident["id"]) for rf in surfaced_factors
    ]

    strongest_counter_date = None
    if past_failure is not None:
        strongest_counter_date = past_failure["timestamp"][:10]
        skeptic_case.insert(
            0,
            f"This exact action type failed its Post-Action Health Check on "
            f"{strongest_counter_date} — the system is not asking you to trust a clean track record.",
        )
    elif not surfaced_factors:
        skeptic_case.append(build_skeptic_no_risk_factor(incident["id"] + "skeptic"))

    # ---------- Consensus Confidence Score ----------
    penalty = PENALTY_PER_RISK_FACTOR * len(surfaced_factors)
    if past_failure is not None:
        penalty += PAST_FAILURE_PENALTY
    bonus = HIGH_TRUST_BONUS if (ratio is not None and ratio >= HIGH_TRUST_RATIO_THRESHOLD) else 0

    consensus_confidence = round(min(max(raw_confidence - penalty + bonus, 0), 99), 1)

    # ---------- "What would change this verdict" ----------
    if strongest_counter_date is not None:
        verdict_line = (
            f"What would change this verdict: proof this rule's rollback plan has been "
            f"corrected and re-tested since the {strongest_counter_date} failure."
        )
    elif surfaced_factors:
        verdict_line = f"What would change this verdict: ruling out that {surfaced_factors[0]}."
    else:
        verdict_line = "What would change this verdict: a documented risk factor for this rule that hasn't been recorded yet."

    return {
        "advocate_case": advocate_case,
        "skeptic_case": skeptic_case,
        "consensus_confidence": consensus_confidence,
        "verdict_line": verdict_line,
    }