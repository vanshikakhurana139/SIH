from reasoning_engine import diagnose_incident

# Hand-written fake Incident — exactly the shape Phase 1 produces,
# but we're not calling Phase 1's code at all here.
fake_incident = {
    "id": "test-1234",
    "severity": "high",
    "source": "turbine_temp",
    "triggered_at": "2026-08-15T10:00:00Z",
    "sensor_value": 96.2,
    "threshold": 95.0,
    "rule_id": "PP-001",
    "status": "pending_rule_match",
    "evidence": "",
    "confidence": None,
    "recommended_action": "",
    "rollback_plan": [],
    "reversible": True,
}

# Hand-written fake Rule — exactly the shape from rules_powerplant.json
fake_rule = {
    "rule_id": "PP-001",
    "sensor": "turbine_temp",
    "operator": ">",
    "threshold": 95.0,
    "severity": "high",
    "suggested_actions": [
        "Reduce turbine load to 60%",
        "Increase coolant flow rate to secondary loop",
        "Notify shift engineer",
    ],
    "rollback_steps": [
        "Restore turbine load to previous setpoint",
        "Return coolant flow rate to normal baseline",
    ],
    "reversible": True,
}

result = diagnose_incident(fake_incident, fake_rule)

print("Evidence:       ", result["evidence"])
print("Confidence:      ", result["confidence"])
print("Recommended:     ", result["recommended_action"])
print("Rollback plan:   ", result["rollback_plan"])
print("Status:          ", result["status"])