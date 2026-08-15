// api.js
import {
  mockIncident,
  mockRecentIncidents,
  mockTrustScores,
  mockHealthCheck,
  mockStats,
} from "../data/mockData";

const FAKE_DELAY = 300;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getActiveIncident() {
  await delay(FAKE_DELAY);
  return mockIncident;
}

export async function getIncidents() {
  await delay(FAKE_DELAY);
  return mockRecentIncidents;
}

export async function getTrustScores() {
  await delay(FAKE_DELAY);
  return mockTrustScores;
}

export async function getHealthCheck() {
  await delay(FAKE_DELAY);
  return mockHealthCheck;
}

export async function getStats() {
  await delay(FAKE_DELAY);
  return mockStats;
}

export async function simulateIncident(sensorData) {
  await delay(FAKE_DELAY);
  console.log("Mock simulateIncident called with:", sensorData);
  return { matched: true, incident: mockIncident };
}

export async function approveAction(incidentId) {
  await delay(FAKE_DELAY);
  console.log("Mock approveAction called for:", incidentId);
  return { ...mockIncident, status: "approved" };
}

export async function rejectAction(incidentId) {
  await delay(FAKE_DELAY);
  console.log("Mock rejectAction called for:", incidentId);
  return { ...mockIncident, status: "rejected" };
}

export async function modifyAction(incidentId, newAction) {
  await delay(FAKE_DELAY);
  console.log("Mock modifyAction called for:", incidentId, newAction);
  return { ...mockIncident, recommended_action: newAction, status: "modified" };
}
