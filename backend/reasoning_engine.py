"""
Local, deterministic Reasoning Engine.
No network calls. No external API. Works with Wi-Fi off.

Confidence formula (documented here for the patent notes):
    confidence = BASE + overage_points + trust_points
    - BASE = 50 (a baseline "something is definitely wrong" score)
    - overage_points = how far past threshold the reading is, as a
      percentage of the threshold itself, capped at +30
    - trust_points = this rule_id's historical Trust Score (0.0-1.0,
      from Phase 5) scaled to +20. Before Phase 5 exists, we use a
      flat default of 0.5 (=> +10 points), so nothing breaks early.
    - Final score is capped at 99 — we never claim 100% certainty.
"""

BASE_CONFIDENCE = 50
MAX_OVERAGE_POINTS = 30
MAX_TRUST_POINTS = 20
DEFAULT_TRUST_SCORE = 0.5  # used until Phase 5's real trust score exists


def calculate_confidence(sensor_value: float, threshold: float, trust_score: float | None) -> float:
    delta = abs(sensor_value - threshold)
    overage_pct = (delta / threshold) * 100 if threshold != 0 else 0
    overage_points = min(overage_pct * 2, MAX_OVERAGE_POINTS)

    trust = trust_score if trust_score is not None else DEFAULT_TRUST_SCORE
    trust_points = trust * MAX_TRUST_POINTS

    confidence = BASE_CONFIDENCE + overage_points + trust_points
    return round(min(confidence, 99), 1)


def build_evidence_text(incident: dict) -> str:
    delta = round(abs(incident["sensor_value"] - incident["threshold"]), 2)
    return (
        f"Sensor '{incident['source']}' read {incident['sensor_value']}, "
        f"exceeding the {incident['threshold']} threshold by {delta}. "
        f"This matches rule {incident['rule_id']} (severity: {incident['severity']})."
    )


def diagnose_incident(incident: dict, rule: dict, trust_score: float | None = None) -> dict:
    """
    Takes a raw Incident (from Phase 1, evidence/confidence/etc still empty)
    and a matching Rule (from rules.json), and returns an updated Incident
    with evidence, confidence, recommended_action, and rollback_plan filled in.
    """
    updated = dict(incident)  # never mutate the caller's object

    updated["evidence"] = build_evidence_text(incident)
    updated["confidence"] = calculate_confidence(
        incident["sensor_value"], incident["threshold"], trust_score
    )
    updated["recommended_action"] = "; ".join(rule["suggested_actions"])
    updated["rollback_plan"] = rule["rollback_steps"]
    updated["reversible"] = rule["reversible"]
    updated["status"] = "diagnosed"

    return updated