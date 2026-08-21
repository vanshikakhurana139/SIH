import { mockTrustScores, mockHealthCheck, mockStats } from "../data/mockData";

const BASE_URL = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.port === "5173" || window.location.port === "5174")
  ? "http://localhost:8000"
  : "https://sih-fawk.onrender.com";

const MOCK_PHASE5 = false;

export async function simulateIncident(sensor, value) {
  const res = await fetch(`${BASE_URL}/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sensor, value }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Simulation request failed" }));
    throw { status: res.status, detail: err.detail || "Simulation server error" };
  }
  const data = await res.json();
  if (!data.matched) throw { status: 204, detail: "No rule matched this reading" };

  const diagRes = await fetch(`${BASE_URL}/diagnose/${data.incident.id}`, { method: "POST" });
  if (!diagRes.ok) {
    const err = await diagRes.json().catch(() => ({ detail: "Diagnosis failed" }));
    throw { status: diagRes.status, detail: err.detail || "Diagnosis failed" };
  }
  const diagnosed = await diagRes.json();

  try {
    return await crossExamine(diagnosed.id);
  } catch (ceErr) {
    console.warn("Cross examination optional step error:", ceErr);
    return diagnosed;
  }
}

export async function crossExamine(incidentId) {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/cross-examine`, { method: "POST" });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail };
  }
  return res.json();
}

export async function resetActiveIncidents() {
  const res = await fetch(`${BASE_URL}/incidents/reset-active`, { method: "POST" });
  return res.json();
}

export async function getActiveIncident() {
  const res = await fetch(`${BASE_URL}/incidents`);
  const all = await res.json();
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

export async function getScenarios() {
  const res = await fetch(`${BASE_URL}/scenarios`);
  if (!res.ok) throw new Error("Failed to fetch scenarios");
  return res.json();
}

export async function getScenarioRules(scId) {
  const res = await fetch(`${BASE_URL}/scenarios/${scId}/rules`);
  if (!res.ok) throw new Error("Failed to fetch scenario rules");
  return res.json();
}

export async function uploadScenarioRules(scId, file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${BASE_URL}/scenarios/${scId}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail || "Failed to upload rules" };
  }
  return res.json();
}

export async function addNewScenario(scenarioPayload) {
  const res = await fetch(`${BASE_URL}/scenarios/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(scenarioPayload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail || "Failed to add new scenario" };
  }
  return res.json();
}

export async function deleteScenario(scId) {
  const res = await fetch(`${BASE_URL}/scenarios/${scId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail || "Failed to delete scenario" };
  }
  return res.json();
}

export async function getOperators() {
  const res = await fetch(`${BASE_URL}/operators`);
  if (!res.ok) throw new Error("Failed to fetch operators");
  return res.json();
}

export async function setOperatorDuty(opId, onDuty) {
  const res = await fetch(`${BASE_URL}/operators/${opId}/duty`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ on_duty: onDuty }),
  });
  if (!res.ok) throw new Error("Failed to update operator duty");
  return res.json();
}

export async function getEscalationConfig() {
  const res = await fetch(`${BASE_URL}/config/escalation`);
  if (!res.ok) throw new Error("Failed to fetch escalation config");
  return res.json();
}

export async function updateEscalationConfig(slaSeconds) {
  const res = await fetch(`${BASE_URL}/config/escalation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sla_seconds: slaSeconds }),
  });
  if (!res.ok) throw new Error("Failed to update escalation SLA");
  return res.json();
}

export async function manualEscalateIncident(incidentId) {
  const res = await fetch(`${BASE_URL}/incidents/${incidentId}/escalate`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json();
    throw { status: res.status, detail: err.detail || "Failed to escalate incident" };
  }
  return res.json();
}

export async function updateOperatorPhone(opId, phone) {
  const res = await fetch(`${BASE_URL}/operators/${opId}/phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) throw new Error("Failed to update operator phone number");
  return res.json();
}

export async function sendTestPhoneAlert(phone, name = "Operator", channel = "sms", message = "") {
  const res = await fetch(`${BASE_URL}/alerts/test-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      channel,
      message: message || `🚨 [SENTINEL ALERT] Real-time anomaly test to ${name}. Telemetry nominal.`,
    }),
  });
  if (!res.ok) throw new Error("Failed to dispatch test alert");
  return res.json();
}
