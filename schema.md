# SENTINEL Data Contracts

Agreed in Phase 0. Every phase must produce/consume objects in exactly this shape.
Do not add/remove/rename fields without updating this file and re-checking all phases.

## Incident object

```json
{
  "id": "string (uuid)",
  "severity": "low | medium | high | critical",
  "source": "string (sensor/log name, e.g. 'furnace_temp')",
  "triggered_at": "ISO8601 timestamp string",
  "sensor_value": "number",
  "threshold": "number",
  "rule_id": "string",
  "status": "pending_rule_match | diagnosed | pending_approval | approved | rejected | executed | resolved | failed",
  "evidence": "string (filled by Phase 2, empty until then)",
  "confidence": "number 0-100 (filled by Phase 2)",
  "recommended_action": "string (filled by Phase 2)",
  "rollback_plan": "array of strings (filled by Phase 2)",
  "reversible": "boolean"
}
```

## Action object

```json
{
  "action_id": "string (uuid)",
  "incident_id": "string (foreign key to Incident.id)",
  "steps": "array of strings",
  "reversible": "boolean",
  "rollback_steps": "array of strings",
  "approval_status": "pending | approved | rejected | modified",
  "approved_by": "string (fake admin id is fine)",
  "executed_at": "ISO8601 timestamp string or null",
  "health_check_result": "pending | success | failed | null"
}
```

## Rule (rules.json) — Phase 1 input

```json
{
  "rule_id": "string",
  "sensor": "string",
  "operator": "> | < | ==",
  "threshold": "number",
  "severity": "low | medium | high | critical",
  "suggested_actions": ["array of strings"],
  "rollback_steps": ["array of strings"],
  "reversible": "boolean"
}
```