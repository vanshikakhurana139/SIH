import sqlite3
import json
from pathlib import Path
import hashlib
from datetime import datetime, timezone

DB_PATH = Path(__file__).parent / "sentinel.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # lets us access columns by name
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS rules (
            rule_id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS incidents (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS audit_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            incident_id TEXT NOT NULL,
            event_type TEXT NOT NULL,
            content TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            prev_hash TEXT NOT NULL,
            hash TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS trust_scores (
            rule_id TEXT PRIMARY KEY,
            successful_outcomes INTEGER DEFAULT 0,
            total_outcomes INTEGER DEFAULT 0,
            auto_pilot_enabled INTEGER DEFAULT 0
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS operators (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            on_duty INTEGER DEFAULT 0,
            contact_email TEXT NOT NULL,
            phone TEXT NOT NULL,
            shift_time TEXT NOT NULL,
            title TEXT NOT NULL,
            icon TEXT DEFAULT '👤'
        )
    """)

    # Alter table if existing without phone
    try:
        cur.execute("ALTER TABLE operators ADD COLUMN phone TEXT DEFAULT '+1-555-0199'")
    except Exception:
        pass

    cur.execute("""
        CREATE TABLE IF NOT EXISTS system_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)

    # Seed default config
    cur.execute("INSERT OR IGNORE INTO system_config (key, value) VALUES ('escalation_sla_seconds', '20')")

    # Seed default shift operators & operations head with phone numbers
    default_operators = [
        ("op-1", "Marcus Vance", "shift_operator", 1, "marcus.vance@sentinel-grid.org", "+919729280478", "9:00 AM – 5:00 PM", "Lead Systems Engineer", "🌅"),
        ("op-2", "Elena Rostova", "shift_operator", 0, "elena.rostova@sentinel-grid.org", "+919729280478", "5:00 PM – 1:00 AM", "Critical Infrastructure Specialist", "🌆"),
        ("op-3", "Devon Chen", "shift_operator", 0, "devon.chen@sentinel-grid.org", "+919729280478", "1:00 AM – 9:00 AM", "Safety & Safeguards Overseer", "🌌"),
        ("head-1", "Dr. Sarah Sterling", "ops_head", 1, "sarah.sterling@sentinel-grid.org", "+919729280478", "24/7 Operations Oversight", "Head of Mission Operations", "🎖️"),
    ]
    cur.executemany(
        "INSERT OR REPLACE INTO operators (id, name, role, on_duty, contact_email, phone, shift_time, title, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        default_operators
    )

    conn.commit()
    conn.close()


def save_rules(rules: list[dict]):
    conn = get_connection()
    cur = conn.cursor()
    for rule in rules:
        cur.execute(
            "INSERT OR REPLACE INTO rules (rule_id, data) VALUES (?, ?)",
            (rule["rule_id"], json.dumps(rule)),
        )
    conn.commit()
    conn.close()


def clear_rules():
    """Wipes the active rule set so a scenario swap doesn't mix two industries' rules."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM rules")
    conn.commit()
    conn.close()


def get_all_rules() -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM rules")
    rows = cur.fetchall()
    conn.close()
    return [json.loads(row["data"]) for row in rows]


def save_incident(incident: dict):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO incidents (id, data) VALUES (?, ?)",
        (incident["id"], json.dumps(incident)),
    )
    conn.commit()
    conn.close()


def get_all_incidents() -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM incidents")
    rows = cur.fetchall()
    conn.close()
    return [json.loads(row["data"]) for row in rows]


def clear_pending_incidents():
    """Resolves or clears unhandled pending/diagnosed incidents on startup so app boots in nominal state."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, data FROM incidents")
    rows = cur.fetchall()
    for row in rows:
        inc = json.loads(row["data"])
        if inc.get("status") in ("diagnosed", "pending_approval", "pending_rule_match"):
            inc["status"] = "resolved"
            inc["resolved_at"] = datetime.now(timezone.utc).isoformat()
            cur.execute("UPDATE incidents SET data = ? WHERE id = ?", (json.dumps(inc), inc["id"]))
    conn.commit()
    conn.close()

def get_rule_by_id(rule_id: str) -> dict | None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM rules WHERE rule_id = ?", (rule_id,))
    row = cur.fetchone()
    conn.close()
    return json.loads(row["data"]) if row else None


def get_incident_by_id(incident_id: str) -> dict | None:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM incidents WHERE id = ?", (incident_id,))
    row = cur.fetchone()
    conn.close()
    return json.loads(row["data"]) if row else None

    # ---------- Audit Log (hash-chained) ----------

def append_audit_log(incident_id: str, event_type: str, content: dict) -> dict:
    """
    Appends one tamper-evident row. Each row's hash depends on the previous
    row's hash + this row's content — break any row and every hash after it
    stops matching, which is what makes the chain provably unbroken.
    """
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT hash FROM audit_log WHERE incident_id = ? ORDER BY id DESC LIMIT 1",
        (incident_id,),
    )
    row = cur.fetchone()
    prev_hash = row["hash"] if row else "GENESIS"

    timestamp = datetime.now(timezone.utc).isoformat()
    content_json = json.dumps(content, sort_keys=True)
    combined = f"{prev_hash}|{event_type}|{content_json}|{timestamp}"
    this_hash = hashlib.sha256(combined.encode()).hexdigest()

    cur.execute(
        """INSERT INTO audit_log (incident_id, event_type, content, timestamp, prev_hash, hash)
           VALUES (?, ?, ?, ?, ?, ?)""",
        (incident_id, event_type, content_json, timestamp, prev_hash, this_hash),
    )
    conn.commit()
    conn.close()

    return {
        "incident_id": incident_id,
        "event_type": event_type,
        "content": content,
        "timestamp": timestamp,
        "prev_hash": prev_hash,
        "hash": this_hash,
    }


def get_audit_log(incident_id: str) -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "SELECT event_type, content, timestamp, prev_hash, hash FROM audit_log WHERE incident_id = ? ORDER BY id ASC",
        (incident_id,),
    )
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "event_type": r["event_type"],
            "content": json.loads(r["content"]),
            "timestamp": r["timestamp"],
            "prev_hash": r["prev_hash"],
            "hash": r["hash"],
        }
        for r in rows
    ]


def verify_audit_chain(incident_id: str) -> bool:
    """Recomputes every hash from scratch and confirms nothing was altered."""
    log = get_audit_log(incident_id)
    prev_hash = "GENESIS"
    for entry in log:
        content_json = json.dumps(entry["content"], sort_keys=True)
        combined = f"{prev_hash}|{entry['event_type']}|{content_json}|{entry['timestamp']}"
        expected_hash = hashlib.sha256(combined.encode()).hexdigest()
        if expected_hash != entry["hash"] or entry["prev_hash"] != prev_hash:
            return False
        prev_hash = entry["hash"]
    return True

def get_audit_events_for_rule(rule_id: str, event_types: tuple[str, ...]) -> list[dict]:
    """
    Used by the Skeptic (consensus_engine.py) to find a REAL past failure for
    this rule_id — pulled from the tamper-evident Audit Log, across every past
    incident of this rule, not just the one currently being cross-examined.
    Returns rows newest-first.
    """
    matching_ids = [i["id"] for i in get_all_incidents() if i.get("rule_id") == rule_id]
    if not matching_ids:
        return []

    conn = get_connection()
    cur = conn.cursor()
    id_placeholders = ",".join("?" * len(matching_ids))
    type_placeholders = ",".join("?" * len(event_types))
    cur.execute(
        f"""SELECT event_type, content, timestamp FROM audit_log
            WHERE incident_id IN ({id_placeholders}) AND event_type IN ({type_placeholders})
            ORDER BY id DESC""",
        (*matching_ids, *event_types),
    )
    rows = cur.fetchall()
    conn.close()
    return [
        {"event_type": r["event_type"], "content": json.loads(r["content"]), "timestamp": r["timestamp"]}
        for r in rows
    ]
# ---------- Trust Score ----------

def record_outcome(rule_id: str, success: bool):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM trust_scores WHERE rule_id = ?", (rule_id,))
    row = cur.fetchone()

    if row is None:
        cur.execute(
            "INSERT INTO trust_scores (rule_id, successful_outcomes, total_outcomes, auto_pilot_enabled) VALUES (?, ?, 1, 0)",
            (rule_id, 1 if success else 0),
        )
    else:
        new_success = row["successful_outcomes"] + (1 if success else 0)
        new_total = row["total_outcomes"] + 1
        cur.execute(
            "UPDATE trust_scores SET successful_outcomes = ?, total_outcomes = ? WHERE rule_id = ?",
            (new_success, new_total, rule_id),
        )
    conn.commit()
    conn.close()


def enable_autopilot(rule_id: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO trust_scores (rule_id, successful_outcomes, total_outcomes, auto_pilot_enabled) VALUES (?, 0, 0, 1) "
        "ON CONFLICT(rule_id) DO UPDATE SET auto_pilot_enabled = 1",
        (rule_id,),
    )
    conn.commit()
    conn.close()


AUTO_PILOT_MIN_OUTCOMES = 3
AUTO_PILOT_MIN_RATIO = 0.8


def get_all_trust_scores() -> list[dict]:
    """Joins every known rule with its trust history (defaulting to zero)."""
    rules = get_all_rules()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM trust_scores")
    scores_by_rule = {r["rule_id"]: dict(r) for r in cur.fetchall()}
    conn.close()

    result = []
    for rule in rules:
        rid = rule["rule_id"]
        s = scores_by_rule.get(rid, {"successful_outcomes": 0, "total_outcomes": 0, "auto_pilot_enabled": 0})
        total = s["total_outcomes"]
        successful = s["successful_outcomes"]
        score = round(successful / total, 2) if total > 0 else 0.0
        eligible = total >= AUTO_PILOT_MIN_OUTCOMES and score >= AUTO_PILOT_MIN_RATIO

        result.append({
            "rule_id": rid,
            "label": rule["sensor"].replace("_", " ").title(),
            "score": score,
            "total_outcomes": total,
            "successful_outcomes": successful,
            "auto_pilot_eligible": eligible,
            "auto_pilot_enabled": bool(s["auto_pilot_enabled"]),
        })
    return result


# ---------- Operator & Escalation Management ----------

def get_operators() -> list[dict]:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM operators ORDER BY role DESC, id ASC")
    rows = cur.fetchall()
    conn.close()
    return [
        {
            "id": r["id"],
            "name": r["name"],
            "role": r["role"],
            "on_duty": bool(r["on_duty"]),
            "contact_email": r["contact_email"],
            "phone": r["phone"] if "phone" in r.keys() else "+1 (555) 0199",
            "shift_time": r["shift_time"],
            "title": r["title"],
            "icon": r["icon"],
        }
        for r in rows
    ]


def set_operator_duty(operator_id: str, on_duty: bool):
    conn = get_connection()
    cur = conn.cursor()
    
    # If activating a shift operator, ensure other shift operators are toggled off for clean single-shift duty
    cur.execute("SELECT role FROM operators WHERE id = ?", (operator_id,))
    row = cur.fetchone()
    if row and row["role"] == "shift_operator" and on_duty:
        cur.execute("UPDATE operators SET on_duty = 0 WHERE role = 'shift_operator'")

    cur.execute("UPDATE operators SET on_duty = ? WHERE id = ?", (1 if on_duty else 0, operator_id))
    conn.commit()
    conn.close()


def update_operator_phone(operator_id: str, phone: str):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("UPDATE operators SET phone = ? WHERE id = ?", (phone, operator_id))
    conn.commit()
    conn.close()


def get_active_shift_operator() -> dict:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM operators WHERE role = 'shift_operator' AND on_duty = 1 LIMIT 1")
    row = cur.fetchone()
    if not row:
        cur.execute("SELECT * FROM operators WHERE role = 'shift_operator' LIMIT 1")
        row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "id": "op-1",
        "name": "Marcus Vance",
        "role": "shift_operator",
        "contact_email": "marcus.vance@sentinel-grid.org",
        "shift_time": "9:00 AM – 5:00 PM",
        "title": "Lead Systems Engineer",
        "icon": "🌅",
    }


def get_ops_head() -> dict:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM operators WHERE role = 'ops_head' LIMIT 1")
    row = cur.fetchone()
    conn.close()
    if row:
        return dict(row)
    return {
        "id": "head-1",
        "name": "Dr. Sarah Sterling",
        "role": "ops_head",
        "contact_email": "sarah.sterling@sentinel-grid.org",
        "shift_time": "24/7 Operations Oversight",
        "title": "Head of Mission Operations",
        "icon": "🎖️",
    }


def get_escalation_sla_seconds() -> int:
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT value FROM system_config WHERE key = 'escalation_sla_seconds'")
    row = cur.fetchone()
    conn.close()
    try:
        return int(row["value"]) if row else 20
    except (ValueError, TypeError):
        return 20


def set_escalation_sla_seconds(seconds: int):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO system_config (key, value) VALUES ('escalation_sla_seconds', ?)",
        (str(max(5, seconds)),)
    )
    conn.commit()
    conn.close()


def get_unresolved_incidents_older_than(sla_seconds: int) -> list[dict]:
    """Returns incidents that are diagnosed/pending, have escalation_level == 0, and exceeded SLA seconds."""
    all_incidents = get_all_incidents()
    now = datetime.now(timezone.utc)
    overdue = []
    
    for inc in all_incidents:
        status = inc.get("status")
        # Only escalate un-resolved/active diagnosed incidents
        if status in ("diagnosed", "pending_approval", "pending_rule_match", "active"):
            escalation_level = inc.get("escalation_level", 0)
            if escalation_level == 0:
                triggered_at_str = inc.get("triggered_at")
                if triggered_at_str:
                    try:
                        triggered_at = datetime.fromisoformat(triggered_at_str)
                        if triggered_at.tzinfo is None:
                            triggered_at = triggered_at.replace(tzinfo=timezone.utc)
                        elapsed = (now - triggered_at).total_seconds()
                        if elapsed >= sla_seconds:
                            overdue.append(inc)
                    except Exception:
                        pass
    return overdue


def escalate_incident_record(incident_id: str, ops_head: dict) -> dict | None:
    """Updates incident to escalation_level 1 and assigns to Ops Head."""
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT data FROM incidents WHERE id = ?", (incident_id,))
    row = cur.fetchone()
    if not row:
        conn.close()
        return None

    inc = json.loads(row["data"])
    now_iso = datetime.now(timezone.utc).isoformat()
    inc["escalation_level"] = 1
    inc["escalated_at"] = now_iso
    inc["assigned_operator_id"] = ops_head.get("id", "head-1")
    inc["assigned_operator_name"] = ops_head.get("name", "Dr. Sarah Sterling")
    inc["assigned_operator_role"] = ops_head.get("role", "ops_head")
    inc["escalation_reason"] = "SLA Resolution Threshold Exceeded without Operator Action"

    cur.execute("UPDATE incidents SET data = ? WHERE id = ?", (json.dumps(inc), incident_id))
    conn.commit()
    conn.close()
    return inc

    