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