import requests
import time

BASE_URL = "http://127.0.0.1:8000"

# A slow ramp toward the PP-001 threshold (95.0), then one that matches,
# plus one deliberately safe reading, plus one that hits a different rule.
readings = [
    {"sensor": "turbine_temp", "value": 88.0},   # safe, no match
    {"sensor": "turbine_temp", "value": 91.0},   # safe, no match
    {"sensor": "turbine_temp", "value": 93.5},   # safe, close, no match
    {"sensor": "turbine_temp", "value": 96.2},   # MATCH — PP-001, high severity
    {"sensor": "coolant_pressure", "value": 25.0},  # MATCH — PP-003, medium
    {"sensor": "generator_vibration", "value": 8.1},  # MATCH — PP-002, critical, irreversible
    {"sensor": "turbine_temp", "value": 70.0},   # safe, no match (deliberate negative test)
]

for r in readings:
    resp = requests.post(f"{BASE_URL}/simulate", json=r)
    print(r, "->", resp.json())
    time.sleep(0.5)