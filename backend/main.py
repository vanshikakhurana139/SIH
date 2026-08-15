# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, HTTPException
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from reasoning_engine import diagnose_incident
from database import get_rule_by_id, get_incident_by_id
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from orchestration import execute_action, undo_action
from database import (
    append_audit_log, get_audit_log, verify_audit_chain,
    get_all_trust_scores, enable_autopilot,
)
import json

from database import init_db, save_rules, get_all_rules, save_incident, get_all_incidents
from rule_engine import match_data_point

app = FastAPI(title="SENTINEL Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the DB tables on startup if they don't exist yet
init_db()


class DataPoint(BaseModel):
    sensor: str
    value: float


@app.get("/")
def read_root():
    return {"status": "SENTINEL backend is running"}


@app.post("/rules/upload")
async def upload_rules(file: UploadFile = File(...)):
    """Loads a rules.json file into the database. No hardcoded thresholds."""
    contents = await file.read()
    try:
        rules = json.loads(contents)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file")

    save_rules(rules)
    return {"message": f"{len(rules)} rules loaded", "rules": rules}


@app.get("/rules")
def list_rules():
    return get_all_rules()


@app.post("/simulate")
def simulate(data_point: DataPoint):
    """Accepts one synthetic sensor reading and checks it against loaded rules."""
    rules = get_all_rules()
    if not rules:
        raise HTTPException(status_code=400, detail="No rules loaded — call /rules/upload first")

    incident = match_data_point(data_point.sensor, data_point.value, rules)

    if incident is None:
        return {"matched": False, "message": "No rule matched this data point"}

    save_incident(incident)
    return {"matched": True, "incident": incident}


@app.get("/incidents")
def list_incidents():
    return get_all_incidents()


@app.post("/diagnose/{incident_id}")
def diagnose(incident_id: str):
    """Runs the Reasoning Engine on an already-matched incident."""
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    rule = get_rule_by_id(incident["rule_id"])
    if rule is None:
        raise HTTPException(status_code=404, detail="Matching rule not found")

    diagnosed = diagnose_incident(incident, rule)
    save_incident(diagnosed)  # overwrite with the now-diagnosed version
    return diagnosed


class ModifyRequest(BaseModel):
    recommended_action: str


class ApprovalRequest(BaseModel):
    approved_by: str = "demo_admin"
    confirmed: bool = False
    force_outcome: str | None = None  # "success" | "fail" | None — testing only


@app.post("/actions/{incident_id}/approve")
def approve_action(incident_id: str, body: ApprovalRequest = ApprovalRequest()):
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    requires_extra = incident["severity"] in ("high", "critical") or not incident["reversible"]
    if requires_extra and not body.confirmed:
        raise HTTPException(status_code=428, detail="Requires second confirmation.")

    incident["status"] = "approved"
    incident["approved_by"] = body.approved_by
    save_incident(incident)
    append_audit_log(incident_id, "approved", {"approved_by": body.approved_by})

    rule = get_rule_by_id(incident["rule_id"])
    executed = execute_action(incident, rule, force_outcome=body.force_outcome)
    save_incident(executed)
    return executed


@app.post("/actions/{incident_id}/reject")
def reject_action(incident_id: str, body: ApprovalRequest = ApprovalRequest()):
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident["status"] = "rejected"
    incident["approved_by"] = body.approved_by
    save_incident(incident)
    return incident


@app.post("/actions/{incident_id}/modify")
def modify_action(incident_id: str, body: ModifyRequest):
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident["recommended_action"] = body.recommended_action
    incident["status"] = "approved"
    save_incident(incident)
    return incident


@app.post("/actions/{incident_id}/undo")
def undo(incident_id: str):
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")

    rule = get_rule_by_id(incident["rule_id"])
    try:
        undone = undo_action(incident, rule)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    save_incident(undone)
    return undone


@app.get("/audit-log/{incident_id}")
def audit_log(incident_id: str):
    return get_audit_log(incident_id)


@app.get("/audit-log/{incident_id}/verify")
def verify_log(incident_id: str):
    return {"incident_id": incident_id, "valid": verify_audit_chain(incident_id)}


@app.get("/trust-scores")
def trust_scores():
    return get_all_trust_scores()


@app.post("/trust-scores/{rule_id}/enable-autopilot")
def enable_autopilot_endpoint(rule_id: str):
    enable_autopilot(rule_id)
    return {"rule_id": rule_id, "auto_pilot_enabled": True}


@app.get("/health-check-summary")
def health_check_summary():
    all_incidents = get_all_incidents()
    resolved = sum(1 for i in all_incidents if i["status"] == "resolved")
    failed = sum(1 for i in all_incidents if i["status"] == "failed")
    pending = sum(1 for i in all_incidents if i["status"] in ("approved", "diagnosed"))
    return {"resolved": resolved, "failed": failed, "pending": pending}


@app.get("/stats")
def stats():
    all_incidents = get_all_incidents()
    active = sum(1 for i in all_incidents if i["status"] not in ("resolved", "rejected", "undone"))
    resolved = sum(1 for i in all_incidents if i["status"] == "resolved")
    confidences = [i["confidence"] for i in all_incidents if i.get("confidence")]
    avg_confidence = round(sum(confidences) / len(confidences)) if confidences else 0
    autopilot_types = sum(1 for t in get_all_trust_scores() if t["auto_pilot_enabled"])
    return {
        "activeIncidents": active,
        "resolvedToday": resolved,
        "avgConfidence": avg_confidence,
        "autoPilotEnabled": autopilot_types,
    }