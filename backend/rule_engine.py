import operator
import uuid
from datetime import datetime, timezone

# Maps the string operator from JSON to an actual Python function.
# This is the trick that keeps the matching logic 100% generic.
OPERATORS = {
    ">": operator.gt,
    "<": operator.lt,
    "==": operator.eq,
}


def match_data_point(sensor_name: str, value: float, rules: list[dict]) -> dict | None:
    """
    Checks one incoming (sensor_name, value) reading against every loaded rule.
    Returns the FIRST matching rule's Incident object, or None if nothing matches.
    No sensor name is ever hardcoded here — everything comes from `rules`.
    """
    for rule in rules:
        if rule["sensor"] != sensor_name:
            continue

        compare = OPERATORS[rule["operator"]]
        if compare(value, rule["threshold"]):
            return build_incident(sensor_name, value, rule)

    return None


def build_incident(sensor_name: str, value: float, rule: dict) -> dict:
    """Builds an Incident object matching schema.md exactly."""
    return {
        "id": str(uuid.uuid4()),
        "severity": rule["severity"],
        "source": sensor_name,
        "triggered_at": datetime.now(timezone.utc).isoformat(),
        "sensor_value": value,
        "threshold": rule["threshold"],
        "rule_id": rule["rule_id"],
        "status": "pending_rule_match",
        "evidence": "",              # filled in Phase 2
        "confidence": None,          # filled in Phase 2
        "recommended_action": "",    # filled in Phase 2
        "rollback_plan": [],         # filled in Phase 2
        "reversible": rule["reversible"],
    }