import sqlite3
import json
from pathlib import Path

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