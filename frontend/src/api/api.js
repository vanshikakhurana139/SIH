import { mockTrustScores, mockHealthCheck, mockStats } from "../data/mockData";

const BASE_URL = "http://127.0.0.1:8000";

// Trust Score / Health Check / Stats endpoints don't exist until Phase 5 —
// stay mocked here on purpose so Phase 4 doesn't block waiting on them.
const MOCK_PHASE5 = false;

export async function simulateIncident(sensor, value) {
  const res = await fetch(`${BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sensor, value }),
  });
  const data = await res.json();
  if (!data.matched) throw { status: 204, detail: "No rule matched this reading" };

  const diagRes = await fetch(`${BASE_URL}/diagnose/${data.incident.id}`, { method: "POST" });
  return diagRes.json();
}

export async function getActiveIncident() {
  const res = await fetch(`${BASE_URL}/incidents`);
  const all = await res.json();
  // Most recently triggered incident that's still awaiting a decision
  const pending = all.filter((i) => i.status === "diagnosed");
  if (pending.length === 0) return null;
  return pending.sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at))[0];
}

export async function getIncidents() {
  const res = await fetch(`${BASE_URL}/incidents`);
  return res.json();
}

async function postAction(incidentId, action, body) {
  const res = await fetch(`${BASE_URL}/actions/${incidentId}/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail };
  }
  return res.json();
}

export async function approveAction(incidentId, confirmed = false, forceOutcome = null) {
  return postAction(incidentId, "approve", { confirmed, force_outcome: forceOutcome });
}

export async function rejectAction(incidentId) {
  return postAction(incidentId, "reject", {});
}

export async function modifyAction(incidentId, newAction) {
  const res = await fetch(`${BASE_URL}/actions/${incidentId}/modify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recommended_action: newAction }),
  });
  return res.json();
}

export async function getTrustScores() {
  if (MOCK_PHASE5) return Promise.resolve(mockTrustScores);
  const res = await fetch(`${BASE_URL}/trust-scores`);
  return res.json();
}

export async function getHealthCheck() {
  if (MOCK_PHASE5) return Promise.resolve(mockHealthCheck);
  const res = await fetch(`${BASE_URL}/health-check-summary`);
  return res.json();
}

export async function getStats() {
  if (MOCK_PHASE5) return Promise.resolve(mockStats);
  const res = await fetch(`${BASE_URL}/stats`);
  return res.json();
}

export async function undoAction(incidentId) {
  const res = await fetch(`${BASE_URL}/actions/${incidentId}/undo`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail };
  }
  return res.json();
}

export async function enableAutopilot(ruleId) {
  const res = await fetch(`${BASE_URL}/trust-scores/${ruleId}/enable-autopilot`, { method: "POST" });
  return res.json();
}

export async function loadScenario(name) {
  const res = await fetch(`${BASE_URL}/scenario/${name}`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail };
  }
  return res.json();
}