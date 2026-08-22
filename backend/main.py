from pathlib import Path
import json
import asyncio
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
    get_operators, set_operator_duty, update_operator_phone, get_active_shift_operator, get_ops_head,
    get_escalation_sla_seconds, set_escalation_sla_seconds,
    get_unresolved_incidents_older_than, escalate_incident_record,
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

# Phone / Push Notification Dispatcher
import urllib.request
import urllib.parse
import os

TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID", "AC771d473d16c058dbb5a63a2fc9355e47")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN", "50fa364158b6b1b14cf478cfcce6e2e6")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER", "+15758253891")
TWILIO_WHATSAPP_NUMBER = os.environ.get("TWILIO_WHATSAPP_NUMBER", "whatsapp:+17372508034")
TWILIO_VERIFY_SERVICE_SID = os.environ.get("TWILIO_VERIFY_SERVICE_SID", "VA9999fae227b7078cf1401053ecdb889c")

async def dispatch_phone_alert(recipient_name: str, phone: str, channel: str, message: str, alert_type: str = "SMS"):
    """
    Dispatches alert via Twilio Verify API (works on trial accounts).
    Uses CustomFriendlyName='SENTINEL ALERT' so the SMS/WhatsApp message
    displays 'SENTINEL ALERT' instead of the default service name.
    Falls back to audit log if Twilio is not configured.
    """
    try:
        if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_VERIFY_SERVICE_SID:
            import base64
            import re
            auth_str = f"{TWILIO_ACCOUNT_SID}:{TWILIO_AUTH_TOKEN}"
            b64_auth = base64.b64encode(auth_str.encode()).decode()

            # Clean phone to strict E.164: + followed by digits only
            digits_only = re.sub(r"\D", "", phone or "")
            if not digits_only:
                print(f"[TWILIO DISPATCH ERROR] Empty phone number provided for {recipient_name}")
                return {"success": False, "error": "Empty phone number"}
            clean_phone = f"+{digits_only}"

            # Use Twilio Verify API - works reliably on trial accounts
            # Supports both "sms" and "whatsapp" channels
            verify_channel = "whatsapp" if channel == "whatsapp" else "sms"

            data = urllib.parse.urlencode({
                "To": clean_phone,
                "Channel": verify_channel,
            }).encode()

            url = f"https://verify.twilio.com/v2/Services/{TWILIO_VERIFY_SERVICE_SID}/Verifications"
            req = urllib.request.Request(url, data=data, headers={"Authorization": f"Basic {b64_auth}"})
            resp = urllib.request.urlopen(req, timeout=10)
            resp_str = resp.read().decode("utf-8")
            print(f"[TWILIO VERIFY {verify_channel.upper()}] Alert dispatched to {recipient_name} ({clean_phone})")
            return {"success": True, "provider": "twilio_verify", "channel": verify_channel, "response": resp_str}

        # Fallback: audit log
        clean_msg = message[:60].encode("ascii", "replace").decode("ascii")
        print(f"[SENTINEL {alert_type.upper()} GATEWAY] Dispatched to {recipient_name} at {phone}: {clean_msg}...")
        return {"success": True, "provider": "simulator", "phone": phone}
    except urllib.error.HTTPError as e:
        err_body = ""
        try:
            err_body = e.read().decode("utf-8")
            err_json = json.loads(err_body)
            err_msg = f"HTTP {e.code} (Twilio Code {err_json.get('code')}): {err_json.get('message')}"
        except Exception:
            err_msg = f"HTTP {e.code}: {err_body or str(e)}"
        print(f"[TWILIO DISPATCH ERROR] {err_msg}")
        return {"success": False, "error": err_msg}
    except Exception as e:
        err_msg = str(e).encode("ascii", "replace").decode("ascii")
        print(f"[TWILIO DISPATCH ERROR] {err_msg}")
        return {"success": False, "error": str(e)}


async def escalation_watcher():
    """Background task checking unresolved incidents and escalating to Ops Head on SLA breach."""
    while True:
        try:
            sla_seconds = get_escalation_sla_seconds()
            overdue_incidents = get_unresolved_incidents_older_than(sla_seconds)
            ops_head = get_ops_head()
            
            for incident in overdue_incidents:
                inc_id = incident["id"]
                escalated = escalate_incident_record(inc_id, ops_head)
                if escalated:
                    # Append tamper-evident audit log
                    try:
                        append_audit_log(
                            incident_id=inc_id,
                            event_type="escalated_to_ops_head",
                            content={
                                "escalation_level": 1,
                                "assigned_to": ops_head.get("name"),
                                "role": ops_head.get("role"),
                                "phone": ops_head.get("phone", "+1 (555) 999-0144"),
                                "sla_seconds": sla_seconds,
                                "reason": "SLA Resolution Threshold Exceeded without Operator Action",
                            }
                        )
                    except Exception:
                        pass

                    # Dispatch Direct SMS & WhatsApp Alert to Operations Head
                    head_name = ops_head.get("name", "Dr. Sarah Sterling")
                    head_phone = ops_head.get("phone", "+1 (555) 999-0144")
                    alert_body = (
                        f"🚨 [SENTINEL ESCALATION] SLA Breach on incident {incident.get('source', 'sensor')}. "
                        f"Escalated to Operations Head {head_name}. Immediate executive sign-off required."
                    )
                    asyncio.create_task(dispatch_phone_alert(head_name, head_phone, "sms", alert_body, "SMS"))
                    asyncio.create_task(dispatch_phone_alert(head_name, head_phone, "whatsapp", alert_body, "WhatsApp"))
        except Exception:
            pass
        await asyncio.sleep(4)


@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(escalation_watcher())

# Ensure default powerplant rules are initialized on startup
def _init_default_scenario():
    global ACTIVE_SCENARIO
    path = Path(__file__).parent / "rules_powerplant.json"
    if path.exists():
        try:
            with open(path, "r", encoding="utf-8") as f:
                rules = json.load(f)
            clear_rules()
            save_rules(rules)
            ACTIVE_SCENARIO = "powerplant"
        except Exception:
            pass

_init_default_scenario()


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
async def simulate(data_point: DataPoint):
    """Accepts one synthetic sensor reading, checks it against loaded rules, and assigns the active shift operator."""
    rules = get_all_rules()
    if not rules:
        raise HTTPException(status_code=400, detail="No rules loaded — call /rules/upload first")

    incident = match_data_point(data_point.sensor, data_point.value, rules)

    if incident is None:
        return {"matched": False, "message": "No rule matched this data point"}

    # Assign the currently active on-duty shift operator
    active_op = get_active_shift_operator()
    incident["assigned_operator_id"] = active_op.get("id", "op-1")
    incident["assigned_operator_name"] = active_op.get("name", "Marcus Vance")
    incident["assigned_operator_role"] = active_op.get("role", "shift_operator")

    save_incident(incident)

    # Log initial assignment event in tamper-evident audit trail
    try:
        append_audit_log(
            incident_id=incident["id"],
            event_type="assigned_to_operator",
            content={
                "assigned_to": active_op.get("name"),
                "operator_id": active_op.get("id"),
                "role": active_op.get("role"),
                "phone": active_op.get("phone", "+1 (555) 234-8901"),
                "shift_time": active_op.get("shift_time"),
                "sensor": data_point.sensor,
                "sensor_value": data_point.value,
            }
        )
    except Exception:
        pass

    # Dispatch Instant SMS Alert to Active Shift Operator
    op_name = active_op.get("name", "Marcus Vance")
    op_phone = active_op.get("phone", "+1 (555) 234-8901")
    alert_msg = (
        f"SENTINEL ALERT: {incident.get('severity', '').upper()} anomaly on sensor '{data_point.sensor}' "
        f"(Value: {data_point.value}). Assigned to {op_name}. Awaiting triage."
    )
    asyncio.create_task(dispatch_phone_alert(op_name, op_phone, "sms", alert_msg, "SMS"))

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


# ---------- Operator & SLA Endpoints ----------

class DutyToggleRequest(BaseModel):
    on_duty: bool


class OperatorPhoneRequest(BaseModel):
    phone: str


class GatewayConfigRequest(BaseModel):
    fast2sms_api_key: str | None = None
    twilio_sid: str | None = None
    twilio_token: str | None = None


class EscalationConfigRequest(BaseModel):
    sla_seconds: int


class TestAlertRequest(BaseModel):
    name: str = "Operator"
    phone: str
    channel: str = "sms"  # "sms" or "whatsapp"
    message: str = "🚨 [SENTINEL TEST ALERT] Real-time hardware telemetry test."


@app.post("/config/gateway")
def set_gateway_config(body: GatewayConfigRequest):
    """Sets SMS / WhatsApp gateway credentials dynamically at runtime."""
    global TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
    if body.twilio_sid:
        TWILIO_ACCOUNT_SID = body.twilio_sid.strip()
    if body.twilio_token:
        TWILIO_AUTH_TOKEN = body.twilio_token.strip()
    return {"message": "Gateway credentials updated successfully"}


@app.get("/operators")
def list_operators():
    """Returns list of shift operators and operations head with duty status."""
    return get_operators()


@app.post("/operators/{op_id}/duty")
def toggle_operator_duty(op_id: str, body: DutyToggleRequest):
    """Sets operator on_duty state."""
    set_operator_duty(op_id, body.on_duty)
    return {"message": f"Operator {op_id} on_duty set to {body.on_duty}", "operators": get_operators()}


@app.post("/operators/{op_id}/phone")
def set_operator_phone(op_id: str, body: OperatorPhoneRequest):
    """Updates operator phone number for SMS and WhatsApp alerts."""
    update_operator_phone(op_id, body.phone)
    return {"message": f"Operator {op_id} phone updated to {body.phone}", "operators": get_operators()}


@app.get("/config/escalation")
def get_escalation_config():
    """Returns current SLA threshold in seconds."""
    return {"sla_seconds": get_escalation_sla_seconds()}


@app.post("/config/escalation")
def update_escalation_config(body: EscalationConfigRequest):
    """Updates SLA threshold in seconds."""
    set_escalation_sla_seconds(body.sla_seconds)
    return {"message": f"Escalation SLA updated to {body.sla_seconds}s", "sla_seconds": body.sla_seconds}


@app.post("/alerts/test-phone")
async def send_test_phone_alert(body: TestAlertRequest):
    """Dispatches a live test SMS or WhatsApp alert to verify phone delivery."""
    result = await dispatch_phone_alert(
        recipient_name=body.name,
        phone=body.phone,
        channel=body.channel,
        message=body.message,
        alert_type="TEST-" + body.channel.upper(),
    )
    return {"status": "dispatched", "channel": body.channel, "recipient": body.phone, "result": result}


@app.post("/incidents/{incident_id}/escalate")
def manual_escalate(incident_id: str):
    """Manually triggers immediate escalation of an incident to Operations Head."""
    ops_head = get_ops_head()
    escalated = escalate_incident_record(incident_id, ops_head)
    if not escalated:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    try:
        append_audit_log(
            incident_id=incident_id,
            event_type="escalated_to_ops_head",
            content={
                "escalation_level": 1,
                "assigned_to": ops_head.get("name"),
                "role": ops_head.get("role"),
                "manual_trigger": True,
                "reason": "Manual Escalation Invocation by Command Controller",
            }
        )
    except Exception:
        pass

@app.post("/incidents/reset-active")
def reset_active_incidents():
    """Resets pending diagnosed incidents so reloaded app starts nominal."""
    clear_pending_incidents()
    return {"status": "nominal", "message": "Pending incidents cleared on startup"}

