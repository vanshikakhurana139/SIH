"""
Phase 1 checklist item 1: build_case() must return a structured Advocate
case and Skeptic case for at least 5 hand-written test incidents, using
only local rule data. This script covers 5 incidents across both
scenarios, plus one that simulates a rule with a real past failure.
"""
from consensus_engine import build_case

RULE_PP001 = {
    "rule_id": "PP-001", "sensor": "turbine_temp", "operator": ">", "threshold": 95.0,
    "severity": "high", "reversible": True,
    "suggested_actions": ["Reduce turbine load to 60%"],
    "rollback_steps": ["Restore turbine load to previous setpoint"],
    "risk_factors": [
        "Sensor may be reading a transient spike, not a sustained rise",
        "Reducing turbine load can itself trigger a brief vibration transient",
    ],
}

RULE_PP002 = {
    "rule_id": "PP-002", "sensor": "generator_vibration", "operator": ">", "threshold": 7.5,
    "severity": "critical", "reversible": False,
    "suggested_actions": ["Emergency shutdown of generator unit"],
    "rollback_steps": ["Cannot be rolled back automatically"],
    "risk_factors": [
        "Emergency shutdown carries its own restart risk on aging bearings",
        "Vibration sensors near this unit have a known history of loose-mount false readings",
    ],
}

RULE_HOSP002 = {
    "rule_id": "HOSP-002", "sensor": "spo2", "operator": "<", "threshold": 90.0,
    "severity": "critical", "reversible": False,
    "suggested_actions": ["Administer supplemental oxygen immediately"],
    "rollback_steps": ["Cannot be rolled back automatically"],
    "risk_factors": [
        "Pulse oximeter readings are unreliable on patients with poor peripheral circulation",
    ],
}

RULE_NO_RISK_FACTORS = {
    "rule_id": "TEST-000", "sensor": "test_sensor", "operator": ">", "threshold": 10.0,
    "severity": "low", "reversible": True,
    "suggested_actions": ["No-op"], "rollback_steps": [], "risk_factors": [],
}


def make_incident(id_, sensor, value, threshold, rule_id, severity, reversible, confidence):
    return {
        "id": id_, "severity": severity, "source": sensor, "triggered_at": "2026-08-17T09:00:00Z",
        "sensor_value": value, "threshold": threshold, "rule_id": rule_id, "status": "diagnosed",
        "evidence": "test evidence", "confidence": confidence,
        "recommended_action": "test action", "rollback_plan": [], "reversible": reversible,
    }


TEST_CASES = [
    # 1. Normal case, no trust history, no past failure
    (make_incident("t1", "turbine_temp", 96.2, 95.0, "PP-001", "high", True, 78.0),
     RULE_PP001, None, None),

    # 2. Strong trust history (should get the +5 bonus), no past failure
    (make_incident("t2", "turbine_temp", 99.0, 95.0, "PP-001", "high", True, 85.0),
     RULE_PP001, {"successful_outcomes": 8, "total_outcomes": 9}, None),

    # 3. Critical/irreversible action, weak trust history (no bonus)
    (make_incident("t3", "generator_vibration", 8.9, 7.5, "PP-002", "critical", False, 90.0),
     RULE_PP002, {"successful_outcomes": 2, "total_outcomes": 4}, None),

    # 4. Hospital scenario, single risk factor
    (make_incident("t4", "spo2", 85.0, 90.0, "HOSP-002", "critical", False, 88.0),
     RULE_HOSP002, None, None),

    # 5. A rule WITH a real past Health Check failure in the Audit Log —
    #    this is the case that must surface the strongest possible counter-evidence.
    (make_incident("t5", "turbine_temp", 97.0, 95.0, "PP-001", "high", True, 80.0),
     RULE_PP001, {"successful_outcomes": 5, "total_outcomes": 7},
     {"event_type": "health_check", "content": {"result": "failed"}, "timestamp": "2026-07-01T12:00:00Z"}),

    # 6. Bonus case: a rule with NO risk_factors configured at all — must fall
    #    back to the generic "no risk factors on file" line, not crash.
    (make_incident("t6", "test_sensor", 12.0, 10.0, "TEST-000", "low", True, 65.0),
     RULE_NO_RISK_FACTORS, None, None),
]


if __name__ == "__main__":
    for incident, rule, trust_score, past_failure in TEST_CASES:
        result = build_case(incident, rule, trust_score=trust_score, past_failure=past_failure)
        print(f"\n=== {incident['id']} ({rule['rule_id']}) ===")
        print("Raw confidence:      ", incident["confidence"])
        print("Advocate case:")
        for line in result["advocate_case"]:
            print("  -", line)
        print("Skeptic case:")
        for line in result["skeptic_case"]:
            print("  -", line)
        print("Consensus confidence:", result["consensus_confidence"])
        print("Verdict line:        ", result["verdict_line"])

        assert isinstance(result["advocate_case"], list) and len(result["advocate_case"]) > 0
        assert isinstance(result["skeptic_case"], list) and len(result["skeptic_case"]) > 0
        assert 0 <= result["consensus_confidence"] <= 99

    print("\nAll 6 test incidents passed.")