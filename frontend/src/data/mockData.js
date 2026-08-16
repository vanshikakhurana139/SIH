// mockData.js
export const mockIncident = {
  id: "inc-8f21a9",
  severity: "high",
  source: "turbine_temp",
  triggered_at: new Date().toISOString(),
  sensor_value: 96.2,
  threshold: 95.0,
  rule_id: "PP-001",
  status: "pending_approval",
  evidence:
    "Sensor turbine_temp read 96.2, exceeding the 95.0 threshold by 1.2. This matches rule PP-001.",
  confidence: 87,
  recommended_action:
    "1. Reduce turbine load to 60%\n2. Increase coolant flow rate to secondary loop\n3. Notify shift engineer",
  rollback_plan: [
    "Restore turbine load to previous setpoint",
    "Return coolant flow rate to normal baseline",
  ],
  reversible: true,
  crystal_ball: {
    if_approved: "82% chance of stabilizing within 10 minutes.",
    if_ignored: "68% chance of emergency shutdown within 25 minutes.",
  },
};

export const mockRecentIncidents = [
  {
    id: "inc-8f21a9",
    severity: "high",
    source: "turbine_temp",
    triggered_at: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "pending_approval",
    confidence: 87,
  },
  {
    id: "inc-3b77c1",
    severity: "medium",
    source: "coolant_pressure",
    triggered_at: new Date(Date.now() - 15 * 60000).toISOString(),
    status: "resolved",
    confidence: 91,
  },
  {
    id: "inc-9e44d0",
    severity: "critical",
    source: "generator_vibration",
    triggered_at: new Date(Date.now() - 40 * 60000).toISOString(),
    status: "executed",
    confidence: 95,
  },
];

export const mockTrustScores = [
  { rule_id: "PP-001", label: "Turbine Overheat", score: 0.75, total_outcomes: 4, auto_pilot_eligible: false },
  { rule_id: "PP-003", label: "Coolant Pressure", score: 1.0, total_outcomes: 3, auto_pilot_eligible: true },
  { rule_id: "PP-002", label: "Generator Vibration", score: 0.5, total_outcomes: 2, auto_pilot_eligible: false },
];

export const mockHealthCheck = {
  resolved: 7,
  failed: 1,
  pending: 1,
};

export const mockStats = {
  activeIncidents: 1,
  resolvedToday: 7,
  avgConfidence: 89,
  autoPilotEnabled: 1,
};
