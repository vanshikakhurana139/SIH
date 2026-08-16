import requests
import time

BASE_URL = "http://127.0.0.1:8000"

readings = [
    {"sensor": "heart_rate", "value": 88},      # safe
    {"sensor": "heart_rate", "value": 135},     # MATCH — HOSP-001, high
    {"sensor": "spo2", "value": 87},            # MATCH — HOSP-002, critical, irreversible
    {"sensor": "systolic_bp", "value": 85},     # MATCH — HOSP-003, medium
    {"sensor": "heart_rate", "value": 75},      # safe, negative test
]

for r in readings:
    resp = requests.post(f"{BASE_URL}/simulate", json=r)
    print(r, "->", resp.json())
    time.sleep(0.5)