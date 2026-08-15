from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
import json

from database import init_db, save_rules, get_all_rules, save_incident, get_all_incidents
from rule_engine import match_data_point

app = FastAPI(title="SENTINEL Backend")

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