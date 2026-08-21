from pathlib import Path
import json
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, UploadFile, File, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel

from reasoning_engine import diagnose_incident
from orchestration import execute_action, undo_action
from consensus_engine import build_case
from database import (
    init_db, save_rules, clear_rules, get_all_rules, save_incident, get_all_incidents,
    get_rule_by_id, get_incident_by_id,
    append_audit_log, get_audit_log, verify_audit_chain,
    get_all_trust_scores, enable_autopilot,
    get_audit_events_for_rule,
    clear_pending_incidents,
)
from rule_engine import match_data_point

app = FastAPI(title="SENTINEL Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        "https://sih-murex-three.vercel.app",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the DB tables on startup if they don't exist yet
init_db()
clear_pending_incidents()


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


SCENARIO_REGISTRY = {
    "powerplant": {
        "id": "powerplant",
        "name": "Power Plant",
        "icon": "⚡",
        "description": "Turbine Temperature, Generator Vibration & Coolant Pressure Safety Rules",
        "file": "rules_powerplant.json",
    },
    "hospital": {
        "id": "hospital",
        "name": "Hospital ICU",
        "icon": "🏥",
        "description": "Cardiac Heart Rate, SpO2 Hypoxia & Systolic Blood Pressure Rules",
        "file": "rules_hospital.json",
    },
}

ACTIVE_SCENARIO = "powerplant"


class DynamicScenarioRequest(BaseModel):
    id: str
    name: str
    description: str = ""
    icon: str = "⚙️"
    rules: list[dict] = []


def _validate_rules_schema(rules):
    if not isinstance(rules, list):
        raise HTTPException(status_code=400, detail="Rules payload must be a JSON array of rule objects")
    for r in rules:
        if not isinstance(r, dict) or "rule_id" not in r or "sensor" not in r or "operator" not in r or "threshold" not in r:
            raise HTTPException(
                status_code=400,
                detail="Invalid rule structure. Each rule must have rule_id, sensor, operator, and threshold"
            )


@app.get("/scenarios")
def get_scenarios():
    """Returns all available scenarios, metadata, rule count, and active status."""
    global ACTIVE_SCENARIO
    result = []
    base_dir = Path(__file__).parent
    for sc_id, sc in SCENARIO_REGISTRY.items():
        file_path = base_dir / sc["file"]
        rules_count = 0
        if file_path.exists():
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    rules_count = len(json.load(f))
            except Exception:
                pass
        result.append({
            "id": sc["id"],
            "name": sc["name"],
            "icon": sc.get("icon", "⚙️"),
            "description": sc.get("description", ""),
            "file": sc["file"],
            "rules_count": rules_count,
            "is_active": ACTIVE_SCENARIO == sc_id,
        })
    return result


@app.get("/scenarios/{sc_id}/rules")
def get_scenario_rules(sc_id: str):
    """Returns the rule file content for a specific scenario."""
    if sc_id not in SCENARIO_REGISTRY:
        raise HTTPException(status_code=404, detail="Scenario not found")
    file_path = Path(__file__).parent / SCENARIO_REGISTRY[sc_id]["file"]
    if not file_path.exists():
        return []
    with open(file_path, "r", encoding="utf-8") as f:
        return json.load(f)


@app.post("/scenarios/{sc_id}/upload")
async def upload_scenario_rules(sc_id: str, file: UploadFile = File(...)):
    """Uploads an actual JSON rule file for a scenario, saves it on disk, and updates active rules if selected."""
    global ACTIVE_SCENARIO
    if sc_id not in SCENARIO_REGISTRY:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    contents = await file.read()
    try:
        rules = json.loads(contents)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON file format")

    _validate_rules_schema(rules)

    file_path = Path(__file__).parent / SCENARIO_REGISTRY[sc_id]["file"]
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(rules, f, indent=2)

    # If this scenario is currently active, load into active DB rules immediately
    if ACTIVE_SCENARIO == sc_id:
        clear_rules()
        save_rules(rules)

    return {
        "message": f"Successfully uploaded and saved {len(rules)} rules for {SCENARIO_REGISTRY[sc_id]['name']}",
        "scenario": sc_id,
        "rules_count": len(rules),
        "rules": rules,
    }


@app.post("/scenarios/add")
def add_new_scenario(body: DynamicScenarioRequest):
    """Creates a new scenario dynamically and saves its initial rules JSON file."""
    global ACTIVE_SCENARIO
    sc_id = body.id.strip().lower().replace(" ", "_")
    if not sc_id:
        raise HTTPException(status_code=400, detail="Scenario ID is required")
    
    file_name = f"rules_{sc_id}.json"
    SCENARIO_REGISTRY[sc_id] = {
        "id": sc_id,
        "name": body.name,
        "icon": body.icon,
        "description": body.description,
        "file": file_name,
    }

    _validate_rules_schema(body.rules)

    file_path = Path(__file__).parent / file_name
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(body.rules, f, indent=2)

    # Auto activate new scenario
    ACTIVE_SCENARIO = sc_id
    clear_rules()
    save_rules(body.rules)

    return {
        "message": f"Scenario '{body.name}' created and activated successfully with {len(body.rules)} rules",
        "scenario": SCENARIO_REGISTRY[sc_id],
        "rules": body.rules,
    }


@app.delete("/scenarios/{sc_id}")
def delete_scenario(sc_id: str):
    """Deletes a custom scenario and its rule file."""
    global ACTIVE_SCENARIO
    if sc_id in ("powerplant", "hospital"):
        raise HTTPException(status_code=400, detail="Default scenarios (Power Plant & Hospital) cannot be deleted")
    if sc_id not in SCENARIO_REGISTRY:
        raise HTTPException(status_code=404, detail="Scenario not found")

    sc = SCENARIO_REGISTRY.pop(sc_id)
    file_path = Path(__file__).parent / sc["file"]
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass

    # If deleted scenario was active, fallback to powerplant
    if ACTIVE_SCENARIO == sc_id:
        load_scenario("powerplant")

    return {"message": f"Scenario '{sc['name']}' deleted successfully", "active_scenario": ACTIVE_SCENARIO}



@app.post("/scenario/{name}")
def load_scenario(name: str):
    """Swaps the entire active rule set — proves genericity with zero code change."""
    global ACTIVE_SCENARIO
    if name not in SCENARIO_REGISTRY:
        raise HTTPException(status_code=404, detail="Unknown scenario")

    path = Path(__file__).parent / SCENARIO_REGISTRY[name]["file"]
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"{path.name} not found on disk")

    with open(path, "r", encoding="utf-8") as f:
        rules = json.load(f)

    ACTIVE_SCENARIO = name
    clear_rules()
    save_rules(rules)
    return {"scenario": name, "rules_loaded": len(rules)}



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


@app.post("/incidents/{incident_id}/cross-examine")
def cross_examine(incident_id: str):
    """
    Runs the Adversarial Consensus Engine on an already-diagnosed incident:
    builds the Advocate case, the Skeptic case, and a Consensus Confidence
    Score, then logs the full exchange as a new hash-linked Audit Log row.
    """
    incident = get_incident_by_id(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    if incident.get("status") not in ("diagnosed", "pending_approval", "approved"):
        raise HTTPException(status_code=400, detail="Incident must be diagnosed before cross-examination")

    rule = get_rule_by_id(incident["rule_id"])
    if rule is None:
        raise HTTPException(status_code=404, detail="Matching rule not found")

    trust_entry = next(
        (t for t in get_all_trust_scores() if t["rule_id"] == incident["rule_id"]), None
    )

    # A real past failure: either a failed Health Check or a completed Undo,
    # from any PAST incident of this same rule_id.
    past_events = get_audit_events_for_rule(incident["rule_id"], ("health_check", "undo_completed"))
    past_failure = next(
        (e for e in past_events if e["event_type"] == "undo_completed" or e["content"].get("result") == "failed"),
        None,
    )

    case = build_case(incident, rule, trust_score=trust_entry, past_failure=past_failure)

    incident["advocate_case"] = case["advocate_case"]
    incident["skeptic_case"] = case["skeptic_case"]
    incident["consensus_confidence"] = case["consensus_confidence"]
    incident["verdict_line"] = case["verdict_line"]
    save_incident(incident)

    append_audit_log(incident_id, "cross_examination", {
        "advocate_case": case["advocate_case"],
        "skeptic_case": case["skeptic_case"],
        "consensus_confidence": case["consensus_confidence"],
        "verdict_line": case["verdict_line"],
    })

    return incident
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
    from datetime import datetime, timezone
    all_incidents = get_all_incidents()
    today = datetime.now(timezone.utc).date().isoformat()
    active = sum(1 for i in all_incidents if i["status"] not in ("resolved", "rejected", "undone", "failed"))
    resolved_today = sum(
        1 for i in all_incidents
        if i["status"] == "resolved"
        and (i.get("resolved_at") or i.get("triggered_at") or "")[:10] == today
    )
    confidences = [i["confidence"] for i in all_incidents if i.get("confidence")]
    avg_confidence = round(sum(confidences) / len(confidences)) if confidences else 0
    autopilot_types = sum(1 for t in get_all_trust_scores() if t["auto_pilot_enabled"])
    return {
        "activeIncidents": active,
        "resolvedToday": resolved_today,
        "avgConfidence": avg_confidence,
        "autoPilotEnabled": autopilot_types,
    }
